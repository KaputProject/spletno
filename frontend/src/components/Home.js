import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, Button, Avatar, Paper, Grid, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);

    const sankeyChartRef = useRef(null);
    const barChartRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (user && token) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_BACKEND_URL}/users/${user._id}/statistics`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("Prejeti podatki:", response.data);
                    setStats(response.data);
                } catch (err) {
                    console.error("Napaka pri pridobivanju statistike:", err.response?.data || err.message);
                }
            }
        };
        fetchStats();
    }, [user]);

    useEffect(() => {
        if (stats && sankeyChartRef.current) {
            drawSankeyDiagram();
            drawBarChart();
        }
    }, [stats]);

    const drawSankeyDiagram = () => {
        if (!stats || !stats.accounts || !stats.user || !Array.isArray(stats.accounts) || !Array.isArray(stats.user.partners)) return;

        const data = {
            nodes: [],
            links: []
        };

        // Ustvari unikate računov in partnerjev
        const allNodes = [
            ...stats.accounts
                .filter(acc => typeof acc.name === 'string') // zaščita
                .map(acc => ({ name: acc.name, type: 'account' })),
            ...stats.user.partners
                .filter(p => typeof p.name === 'string') // zaščita
                .map(p => ({ name: p.name, type: 'partner' }))
        ];

        // Odstrani podvojene node po imenu
        data.nodes = Array.from(new Map(allNodes.map(n => [n.name, n])).values());

        // Povezave iz transakcij
        stats.accounts.forEach(acc => {
            if (!acc || !acc.name || !Array.isArray(acc.statements)) return;

            acc.statements.forEach(stmt => {
                if (!stmt || !Array.isArray(stmt.transactions)) return;

                stmt.transactions.forEach(txn => {
                    if (!txn) return;

                    const partner = txn.partner_parsed || txn.location;
                    const partnerName = partner?.name;
                    const value = Number(txn.change);

                    if (partnerName && acc.name && !isNaN(value) && value !== 0) {
                        data.links.push({
                            source: acc.name,
                            target: partnerName,
                            value: Math.abs(value)
                        });
                    }
                });
            });
        });

        const width = 600;
        const height = 400;

        const svg = d3.select(sankeyChartRef.current)
            .html('')
            .append('svg')
            .attr('viewBox', [0, 0, width, height]);

        const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 6]]);

        const graph = sankeyGenerator({
            nodes: data.nodes.map(d => ({ ...d })),
            links: data.links.map(d => ({ ...d }))
        });

        graph.nodes.forEach((d, i) => {
            if ([d.x0, d.y0, d.x1, d.y1].some(v => typeof v !== 'number' || isNaN(v))) {
                console.warn(`Node at index ${i} has invalid coords`, d);
            }
        });

        svg.append('g')
            .selectAll('rect')
            .data(graph.nodes)
            .join('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', d => d.type === 'account' ? '#2196f3' : '#4caf50')
            .append('title')
            .text(d => `${d.name}\n${Number(d.value || 0).toFixed(2)} €`);

        svg.append('g')
            .attr('fill', 'none')
            .selectAll('path')
            .data(graph.links)
            .join('path')
            .attr('d', sankeyLinkHorizontal())
            .attr('stroke', '#000')
            .attr('stroke-opacity', 0.2)
            .attr('stroke-width', d => Math.max(1, d.width || 1))
            .append('title')
            .text(d => `${d.source.name} → ${d.target.name}\n${Number(d.value || 0).toFixed(2)} €`);

        svg.append('g')
            .style('font', '10px sans-serif')
            .selectAll('text')
            .data(graph.nodes)
            .join('text')
            .attr('x', d => d.x0 - 6)
            .attr('y', d => (d.y1 + d.y0) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text(d => d.name)
            .filter(d => d.x0 < width / 2)
            .attr('x', d => d.x1 + 6)
            .attr('text-anchor', 'start');
    };



    const drawBarChart = () => {
        if (!stats || !barChartRef.current) return;

        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const data = stats.accounts;

        d3.select(barChartRef.current).selectAll('*').remove(); // počisti predhodni graf

        const svg = d3.select(barChartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X os - računi (imena)
        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr('transform', 'rotate(-40)')
            .style('text-anchor', 'end');

        // Y os - vrednosti prihodkov
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.in) || 0])
            .nice()
            .range([height, 0]);

        svg.append('g')
            .call(d3.axisLeft(y));

        // Stolpci
        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.in))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.in))
            .attr('fill', '#2196f3');

        // Dodaj oznake vrednosti nad stolpci
        svg.selectAll('text.label')
            .data(data)
            .join('text')
            .attr('class', 'label')
            .attr('x', d => x(d.name) + x.bandwidth() / 2)
            .attr('y', d => y(d.in) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d.in.toFixed(2) + ' €');
    };


    // Če uporabnik ni prijavljen
    if (!user) {
        return (
            <Box sx={{ textAlign: 'center', p: 4, borderRadius: 4, boxShadow: 3 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to Kaput
                </Typography>
                <Typography sx={{ mt: 2, mb: 4 }}>
                    Welcome to Kaput — the app that generously reminds you you’re terrible with money...
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                    <Button variant="contained" color="primary" size="large" onClick={() => navigate('/login')}>
                        Sign In
                    </Button>
                    <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/register')}>
                        Sign Up
                    </Button>
                </Box>
            </Box>
        );
    }

    // Če statistike še nalagajo
    if (!stats) {
        return <Typography>Loading statistics...</Typography>;
    }

    // Ko so statistike na voljo
    const { user: userData, accounts } = stats;

    // Skupni prihodki/odhodki vseh računov
    const totalIn = accounts.reduce((sum, acc) => sum + acc.in, 0);
    const totalOut = accounts.reduce((sum, acc) => sum + acc.out, 0);

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            {!user ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 4,
                        borderRadius: 4,
                        backgroundColor: 'primary',
                        boxShadow: 3,
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Welcome to Kaput
                    </Typography>
                    <Typography sx={{ mt: 2, mb: 4 }}>
                        Welcome to Kaput — the app that generously reminds you you’re terrible with money...
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Button variant="contained" color="primary" size="large" onClick={() => navigate('/login')}>
                            Sign In
                        </Button>
                        <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/register')}>
                            Sign Up
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ width: '100%', mt: 2, px: 2 }}>
                    {/* Profil */}
                    <Paper sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                            src={`${process.env.REACT_APP_BACKEND_URL}${user.avatarUrl}`}
                            alt="avatar"
                            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {user.name} {user.surname}
                            </Typography>
                            <Typography color="text.secondary">{user.email}</Typography>
                        </Box>
                    </Paper>

                    {/* Statistike */}
                    <Paper sx={{ p: 4, mt: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Your Financial Summary
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Number of Accounts:</Typography>
                                <Typography variant="h6">{stats.accounts.length}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Total Inflow:</Typography>
                                <Typography variant="h6" color="success.main">
                                    {stats.accounts.reduce((sum, acc) => sum + acc.in, 0).toFixed(2)} €
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Total Outflow:</Typography>
                                <Typography variant="h6" color="error.main">
                                    {stats.accounts.reduce((sum, acc) => sum + acc.out, 0).toFixed(2)} €
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Total Transactions:</Typography>
                                <Typography variant="h6">
                                    {stats.accounts.reduce((sum, acc) => sum + acc.transactions, 0)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Average per Transaction:</Typography>
                                <Typography variant="h6">
                                    {(() => {
                                        const totalTransactions = stats.accounts.reduce((sum, acc) => sum + acc.transactions, 0);
                                        const totalChange = stats.accounts.reduce((sum, acc) => sum + acc.in + acc.out, 0);
                                        return totalTransactions > 0 ? (totalChange / totalTransactions).toFixed(2) : '0.00';
                                    })()} €
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Average Transactions per Account:</Typography>
                                <Typography variant="h6">
                                    {stats.accounts.length > 0
                                        ? (stats.accounts.reduce((sum, acc) => sum + acc.transactions, 0) / stats.accounts.length).toFixed(2)
                                        : '0.00'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Number of Partners:</Typography>
                                <Typography variant="h6">{user.partners.length}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Biggest Transaction:</Typography>
                                <Typography variant="h6">
                                    {(() => {
                                        let max = 0;
                                        stats.accounts.forEach(acc => {
                                            acc.statements.forEach(stmt => {
                                                stmt.partners.forEach(partner => {
                                                    if (Math.abs(partner.amount) > max) {
                                                        max = Math.abs(partner.amount);
                                                    }
                                                });
                                            });
                                        });
                                        return max.toFixed(2) + ' €';
                                    })()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle1" color="text.secondary">Average Monthly Inflow:</Typography>
                                <Typography variant="h6">
                                    {(() => {
                                        const months = new Set();
                                        stats.accounts.forEach(acc =>
                                            acc.statements.forEach(stmt => {
                                                if (stmt.in > 0) {
                                                    months.add(`${stmt.month}-${stmt.year}`);
                                                }
                                            })
                                        );
                                        const totalIn = stats.accounts.reduce((sum, acc) =>
                                            sum + acc.statements.reduce((s, stmt) => s + stmt.in, 0), 0);
                                        return months.size > 0 ? (totalIn / months.size).toFixed(2) : '0.00';
                                    })()} €
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Sankey Diagram */}
                    <Paper sx={{ p: 4, mt: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Financial Flows (Sankey Diagram)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box ref={sankeyChartRef} />
                    </Paper>

                    <Paper sx={{ p: 4, mt: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Account Inflows (Bar Chart)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box ref={barChartRef} />
                    </Paper>

                    <Paper sx={{ p: 4, mt: 4 }}>
                        <pre>{JSON.stringify(stats, null, 2)}</pre>
                    </Paper>
                </Box>
            )}
        </Box>
    );

};

export default Home;
