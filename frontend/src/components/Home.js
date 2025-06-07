import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, Button, Paper, Grid, Divider, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [accountFilter, setAccountFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');

    const sankeyChartRef = useRef(null);
    const barChartRef = useRef(null);
    const txnCountBarChartRef = useRef(null);
    const inPieChartRef = useRef(null);
    const outPieChartRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (user && token) {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_BACKEND_URL}/users/${user._id}/statistics`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setStats(response.data.user);
                } catch (err) {
                    console.error("Error fetching statistics:", err.response?.data || err.message);
                }
            }
        };
        fetchStats();
    }, [user]);

    // Prepare filter options
    const accounts = stats?.accounts || [];
    const accountOptions = [{ value: 'all', label: 'All Accounts' }, ...accounts.map(acc => ({ value: acc._id, label: acc.name }))];
    const allStatements = accounts.flatMap(acc => acc.statements.map(stmt => ({
        value: `${stmt.month}-${stmt.year}`,
        label: `${stmt.month + 1}/${stmt.year}`
    })));
    const uniqueStatements = Array.from(new Map(allStatements.map(s => [s.value, s])).values());
    const monthOptions = [{ value: 'all', label: 'All Months' }, ...uniqueStatements];

    // Filtering logic
    const filteredAccounts = accountFilter === 'all'
        ? accounts
        : accounts.filter(acc => acc._id === accountFilter);

    // For month filter, filter statements and transactions
    const filteredAccountsWithStatements = filteredAccounts.map(acc => ({
        ...acc,
        statements: monthFilter === 'all'
            ? acc.statements
            : acc.statements.filter(stmt => `${stmt.month}-${stmt.year}` === monthFilter)
    }));

    // For charts, flatten transactions from filtered statements
    const filteredTransactions = filteredAccountsWithStatements.flatMap(acc =>
        acc.statements.flatMap(stmt => stmt.transactions.map(txn => ({
            ...txn,
            accountName: acc.name
        })))
    );

    useEffect(() => {
        if (stats && sankeyChartRef.current) {
            drawSankeyDiagram();
            drawBarChart();
            drawLocationPieChart();
            drawTxnCountBarChart();
            drawInflowPieChart();
        }

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                drawSankeyDiagram();
                drawSankeyDiagram();
                drawBarChart();
                drawLocationPieChart();
                drawTxnCountBarChart();
                drawInflowPieChart();
            }, 200);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, [stats, accountFilter, monthFilter]);

    const drawSankeyDiagram = () => {
        if (!stats || !Array.isArray(stats.locations)) return;

        const accs = filteredAccountsWithStatements;
        const locs = stats.locations;

        let data = { nodes: [], links: [] };

        const nodeMap = new Map();
        const linkMap = new Map();

        accs.forEach(acc => {
            nodeMap.set(acc.name, { id: acc.name, name: acc.name, type: 'account' });
        });

        accs.forEach(acc => {
            acc.statements.forEach(stmt => {
                stmt.transactions.forEach(txn => {
                    const loc = txn.location;
                    if (!loc) return;

                    if (txn.inflow > 0) {
                        const locId = `${loc.name}_in`;
                        if (!nodeMap.has(locId)) {
                            nodeMap.set(locId, { id: locId, name: loc.name, type: 'location_in' });
                        }

                        const key = `${locId}=>${acc.name}`;
                        linkMap.set(key, (linkMap.get(key) || 0) + txn.inflow);
                    }

                    if (txn.outflow > 0) {
                        const locId = `${loc.name}_out`;
                        if (!nodeMap.has(locId)) {
                            nodeMap.set(locId, { id: locId, name: loc.name, type: 'location_out' });
                        }

                        const key = `${acc.name}=>${locId}`;
                        linkMap.set(key, (linkMap.get(key) || 0) + txn.outflow);
                    }
                });
            });
        });

        data = { nodes: Array.from(nodeMap.values()), links: [] };
        const nameToIndex = new Map(data.nodes.map((node, i) => [node.id, i]));

        for (const [key, value] of linkMap.entries()) {
            const [sourceId, targetId] = key.split('=>');
            if (nameToIndex.has(sourceId) && nameToIndex.has(targetId)) {
                data.links.push({
                    source: nameToIndex.get(sourceId),
                    target: nameToIndex.get(targetId),
                    value
                });
            }
        }

        const container = sankeyChartRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const svg = d3.select(container)
            .html('')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(10)
            .extent([[1, 1], [width - 1, height - 6]]);

        const graph = sankeyGenerator({
            nodes: data.nodes.map(d => ({ ...d })),
            links: data.links.map(d => ({ ...d }))
        });

        // Draw nodes
        svg.append('g')
            .selectAll('rect')
            .data(graph.nodes)
            .join('rect')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('height', d => d.y1 - d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('fill', d => d.type.includes('account') ? '#2196f3' : '#4caf50')
            .append('title')
            .text(d => `${d.name}\n${Number(d.value || 0).toFixed(2)} €`);

        // Draw links
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
            .text(d => {
                const src = d.source.name;
                const tgt = d.target.name;
                return `${src} → ${tgt}\n${Number(d.value || 0).toFixed(2)} €`;
            });

        // Add labels
        svg.append('g')
            .style('font', '10px sans-serif')
            .selectAll('text')
            .data(graph.nodes)
            .join('text')
            .attr('x', d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr('y', d => (d.y0 + d.y1) / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
            .text(d => d.name);
    };

    // Bar chart: wider, prevent label overlap, filtered data
    // Draws a bar chart with values on top of each bar
    const drawBarChart = () => {
        if (!stats || !barChartRef.current) return;

        const container = barChartRef.current;
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;
        const data = filteredAccountsWithStatements.map(acc => ({
            name: acc.name,
            inflow: acc.statements.reduce((sum, stmt) => sum + (stmt.inflow || 0), 0),
            outflow: acc.statements.reduce((sum, stmt) => sum + (stmt.outflow || 0), 0)
        }));

        d3.select(barChartRef.current).selectAll('*').remove();
        const svg = d3.select(barChartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style('text-anchor', 'middle')
            .attr('dx', '0')
            .attr('dy', '1em');

        const maxY = d3.max(data, d => Math.max(d.inflow, d.outflow)) || 0;
        const y = d3.scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([height, 0]);

        svg.append('g').call(d3.axisLeft(y));

        // Draw inflow bars
        svg.selectAll('rect.inflow')
            .data(data)
            .join('rect')
            .attr('class', 'inflow')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.inflow))
            .attr('width', x.bandwidth() / 2)
            .attr('height', d => height - y(d.inflow))
            .attr('fill', '#4caf50');

        // Draw outflow bars
        svg.selectAll('rect.outflow')
            .data(data)
            .join('rect')
            .attr('class', 'outflow')
            .attr('x', d => x(d.name) + x.bandwidth() / 2)
            .attr('y', d => y(d.outflow))
            .attr('width', x.bandwidth() / 2)
            .attr('height', d => height - y(d.outflow))
            .attr('fill', '#f44336');

        // Add values on top of inflow bars
        svg.selectAll('text.inflow-value')
            .data(data)
            .join('text')
            .attr('class', 'inflow-value')
            .attr('x', d => x(d.name) + x.bandwidth() / 4)
            .attr('y', d => y(d.inflow) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#388e3c')
            .text(d => d.inflow.toLocaleString(undefined, { minimumFractionDigits: 2 }));

        // Add values on top of outflow bars
        svg.selectAll('text.outflow-value')
            .data(data)
            .join('text')
            .attr('class', 'outflow-value')
            .attr('x', d => x(d.name) + (3 * x.bandwidth()) / 4)
            .attr('y', d => y(d.outflow) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#b71c1c')
            .text(d => d.outflow.toLocaleString(undefined, { minimumFractionDigits: 2 }));
    };

    const drawTxnCountBarChart = () => {
        if (!stats || !txnCountBarChartRef.current) return;

        const container = barChartRef.current;
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const width = container.clientWidth - margin.left - margin.right;
        const height = container.clientHeight - margin.top - margin.bottom;
        const data = filteredAccountsWithStatements.map(acc => ({
            name: acc.name,
            count: acc.statements.reduce((sum, stmt) => sum + (stmt.total_transactions || 0), 0)
        }));

        d3.select(txnCountBarChartRef.current).selectAll('*').remove();
        const svg = d3.select(txnCountBarChartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style('text-anchor', 'middle')
            .attr('dx', '0')
            .attr('dy', '1em');

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 0])
            .nice()
            .range([height, 0]);

        svg.append('g').call(d3.axisLeft(y));

        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', d => x(d.name))
            .attr('y', d => y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.count))
            .attr('fill', '#ff9800');

        svg.selectAll('text.value')
            .data(data)
            .join('text')
            .attr('class', 'value')
            .attr('x', d => x(d.name) + x.bandwidth() / 2)
            .attr('y', d => y(d.count) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#b26a00')
            .text(d => d.count);
    };

    // Pie chart: bigger, labels only on hover, legend right, filtered data
    const drawLocationPieChart = () => {
        if (!stats || !stats.locations || stats.locations.length === 0) return;

        // Outflow per location, only for filtered transactions
        const outflowByLocation = {};
        filteredTransactions.forEach(txn => {
            if (txn.location && txn.outflow > 0) {
                outflowByLocation[txn.location.name] = (outflowByLocation[txn.location.name] || 0) + txn.outflow;
            }
        });
        const data = Object.entries(outflowByLocation).map(([name, value]) => ({ name, value }));

        const container = outPieChartRef.current;
        const width = container.clientWidth, height = container.clientHeight, radius = Math.min(width, height) / 2.1;
        d3.select('#locationPieChart').selectAll('*').remove();
        d3.select('#locationPieLegend').selectAll('*').remove();

        const svg = d3.select('#locationPieChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeSet2);
        const pie = d3.pie().value(d => d.value);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

        svg.selectAll('path')
            .data(data_ready)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name))
            .attr('stroke', '#fff')
            .style('stroke-width', '2px')
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arcHover);
                svg.selectAll('text').style('opacity', 0);
                d3.select(`#pie-label-${d.index}`).style('opacity', 1);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arc);
                svg.selectAll('text').style('opacity', 0);
            });

        svg.selectAll('text')
            .data(data_ready)
            .join('text')
            .attr('id', d => `pie-label-${d.index}`)
            .text(d => `${d.data.name} (${d.data.value.toFixed(2)} €)`)
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .style('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('fill', '#000')
            .style('opacity', 0);

        const legend = d3.select('#locationPieLegend')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('margin-left', '24px');
        data.forEach((d, i) => {
            const item = legend.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('margin-bottom', '6px');
            item.append('div')
                .style('width', '16px')
                .style('height', '16px')
                .style('margin-right', '8px')
                .style('background-color', color(d.name));
            item.append('span')
                .text(`${d.name}: ${d.value.toFixed(2)} €`)
                .style('color', '#000')
                .style('font-size', '14px');
        });
    };

    const drawInflowPieChart = () => {
        if (!stats || !stats.locations || stats.locations.length === 0) return;

        // Inflow per location, only for filtered transactions
        const inflowByLocation = {};
        filteredTransactions.forEach(txn => {
            if (txn.location && txn.inflow > 0) {
                inflowByLocation[txn.location.name] = (inflowByLocation[txn.location.name] || 0) + txn.inflow;
            }
        });
        const data = Object.entries(inflowByLocation).map(([name, value]) => ({ name, value }));

        const container = inPieChartRef.current;
        const width = container.clientWidth, height = container.clientHeight, radius = Math.min(width, height) / 2.1;
        d3.select('#inflowPieChart').selectAll('*').remove();
        d3.select('#inflowPieLegend').selectAll('*').remove();

        const svg = d3.select('#inflowPieChart')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeSet3);
        const pie = d3.pie().value(d => d.value);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const arcHover = d3.arc().innerRadius(0).outerRadius(radius + 10);

        svg.selectAll('path')
            .data(data_ready)
            .join('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name))
            .attr('stroke', '#fff')
            .style('stroke-width', '2px')
            .on('mouseover', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arcHover);
                svg.selectAll('text').style('opacity', 0);
                d3.select(`#inflow-pie-label-${d.index}`).style('opacity', 1);
            })
            .on('mouseout', function (event, d) {
                d3.select(this).transition().duration(200).attr('d', arc);
                svg.selectAll('text').style('opacity', 0);
            });

        svg.selectAll('text')
            .data(data_ready)
            .join('text')
            .attr('id', d => `inflow-pie-label-${d.index}`)
            .text(d => `${d.data.name} (${d.data.value.toFixed(2)} €)`)
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .style('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('fill', '#000')
            .style('opacity', 0);

        const legend = d3.select('#inflowPieLegend')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('margin-left', '24px');
        data.forEach((d, i) => {
            const item = legend.append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('margin-bottom', '6px');
            item.append('div')
                .style('width', '16px')
                .style('height', '16px')
                .style('margin-right', '8px')
                .style('background-color', color(d.name));
            item.append('span')
                .text(`${d.name}: ${d.value.toFixed(2)} €`)
                .style('color', '#000')
                .style('font-size', '14px');
        });
    };

    if (!user) {
        return (
            <Box sx={{ textAlign: 'center', p: 4, borderRadius: 4, boxShadow: 3 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome to Kaput
                </Typography>
                <Typography sx={{ mt: 2, mb: 4 }}>
                    Welcome to Kaput — the app that generously reminds you you’re terrible with money. Watch your pathetic spending habits mapped out in glorious detail, so you can admire how expertly you throw cash into the void. Bonus: Now with location tracking for all those genius purchases you barely remember making. Bravo, financial mastermind.
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

    if (!stats) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Summary stats from filtered data
    const numAccounts = filteredAccountsWithStatements.length;
    const numLocations = stats.locations.length;
    const numStatements = filteredAccountsWithStatements.reduce((sum, acc) => sum + acc.statements.length, 0);
    const totalIn = filteredAccountsWithStatements.reduce(
        (sum, acc) => sum + acc.statements.reduce((s, stmt) => s + (stmt.inflow || 0), 0), 0
    );
    const totalOut = filteredAccountsWithStatements.reduce(
        (sum, acc) => sum + acc.statements.reduce((s, stmt) => s + (stmt.outflow || 0), 0), 0
    );
    const netFlow = totalIn - totalOut;
    const totalTransactions = filteredTransactions.length;
    const avgInPerAccount = numAccounts > 0 ? totalIn / numAccounts : 0;
    const avgOutPerAccount = numAccounts > 0 ? totalOut / numAccounts : 0;
    const avgInPerTxn = totalTransactions > 0 ? filteredTransactions.reduce((sum, t) => sum + (t.inflow || 0), 0) / totalTransactions : 0;
    const avgOutPerTxn = totalTransactions > 0 ? filteredTransactions.reduce((sum, t) => sum + (t.outflow || 0), 0) / totalTransactions : 0;
    const largestIn = filteredTransactions.reduce((max, t) => t.inflow > (max || 0) ? t.inflow : max, 0);
    const largestOut = filteredTransactions.reduce((max, t) => t.outflow > (max || 0) ? t.outflow : max, 0);
    const mostActiveAccount = (() => {
        const counts = {};
        filteredTransactions.forEach(t => {
            counts[t.accountName] = (counts[t.accountName] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    })();
    const mostActiveLocation = (() => {
        const counts = {};
        filteredTransactions.forEach(t => {
            if (t.location?.name) counts[t.location.name] = (counts[t.location.name] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    })();
    const validDates = filteredTransactions
        .map(t => new Date(t.datetime))
        .filter(d => !isNaN(d));
    const firstTxnDate = validDates.length > 0 ? new Date(Math.min(...validDates)).toLocaleDateString() : '-';
    const lastTxnDate = validDates.length > 0 ? new Date(Math.max(...validDates)).toLocaleDateString() : '-';

    return (
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
            <Paper sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 0 }}>
                        Your Financial History
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Account</InputLabel>
                            <Select value={accountFilter} label="Account" onChange={e => setAccountFilter(e.target.value)}>
                                {accountOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Month</InputLabel>
                            <Select value={monthFilter} label="Month" onChange={e => setMonthFilter(e.target.value)}>
                                {monthOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Number of Accounts:</Typography>
                        <Typography variant="h6">{numAccounts}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Number of Locations:</Typography>
                        <Typography variant="h6">{numLocations}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Number of Months:</Typography>
                        <Typography variant="h6">{numStatements}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Total Transactions:</Typography>
                        <Typography variant="h6">{totalTransactions}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Total Inflow:</Typography>
                        <Typography variant="h6" color="success.main">{totalIn.toLocaleString(undefined, {minimumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Total Outflow:</Typography>
                        <Typography variant="h6" color="error.main">{totalOut.toLocaleString(undefined, {minimumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Net Flow:</Typography>
                        <Typography variant="h6" color={netFlow >= 0 ? "success.main" : "error.main"}>
                            {netFlow.toLocaleString(undefined, {minimumFractionDigits: 2})} €
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Avg. Inflow per Account:</Typography>
                        <Typography variant="h6">{avgInPerAccount.toLocaleString(undefined, {maximumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Avg. Outflow per Account:</Typography>
                        <Typography variant="h6">{avgOutPerAccount.toLocaleString(undefined, {maximumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Avg. Inflow per Transaction:</Typography>
                        <Typography variant="h6">{avgInPerTxn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Avg. Outflow per Transaction:</Typography>
                        <Typography variant="h6">{avgOutPerTxn.toLocaleString(undefined, {maximumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Largest Inflow:</Typography>
                        <Typography variant="h6" color="success.main">{largestIn.toLocaleString(undefined, {minimumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Largest Outflow:</Typography>
                        <Typography variant="h6" color="error.main">{largestOut.toLocaleString(undefined, {minimumFractionDigits: 2})} €</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Most Active Account:</Typography>
                        <Typography variant="h6">{mostActiveAccount}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Most Active Location:</Typography>
                        <Typography variant="h6">{mostActiveLocation}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">First Transaction:</Typography>
                        <Typography variant="h6">{firstTxnDate}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" color="text.secondary">Last Transaction:</Typography>
                        <Typography variant="h6">{lastTxnDate}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Grid
                container
                spacing={2}
                sx={{
                    flexWrap: 'nowrap',
                    height: 800
                }}
            >
                <Grid item sx={{ flex: 2, minWidth: 0, height: '100%' }}>
                    <Paper
                        sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Financial Flows (Sankey Diagram)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                            ref={sankeyChartRef}
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                height: '95%',
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item sx={{ flex: 1, minWidth: 0, height: '100%' }}>
                    <Paper
                        sx={{
                            p: 4,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Locations (Inflow/Outflow)
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                            }}
                        >
                            {stats.locations.map((loc) => (
                                <Box
                                    key={loc._id}
                                    sx={{
                                        flexGrow: 1,
                                        flexBasis: 0,
                                        minWidth: 150,
                                        maxWidth: '33%',
                                        boxSizing: 'border-box',
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Typography variant="subtitle1">{loc.name}</Typography>
                                        <Typography color="success.main">
                                            Inflow: {loc.inflow.toFixed(2)} €
                                        </Typography>
                                        <Typography color="error.main">
                                            Outflow: {loc.outflow.toFixed(2)} €
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper
                        sx={{
                            p: 4,
                            display: 'flex',
                            gap: 4,
                            height: 600,
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Outflow per Location (Pie Chart)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box id="locationPieChart" ref={outPieChartRef} sx={{ width: '100%', height: '95%' }} />
                        </Box>
                        <Box id="locationPieLegend" sx={{ minWidth: 80, maxWidth: '30%' }} />
                    </Paper>
                </Grid>

                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper
                        sx={{
                            p: 4,
                            display: 'flex',
                            gap: 4,
                            height: 600,
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Inflow per Location (Pie Chart)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box id="inflowPieChart" ref={inPieChartRef} sx={{ width: '100%', height: '95%' }} />
                        </Box>
                        <Box id="inflowPieLegend" sx={{ minWidth: 80, maxWidth: '30%' }} />
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2, width: '100%' }}>
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, width: '100%', boxSizing: 'border-box', height: 500 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Account Inflow/Outflow (Bar Chart)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box ref={barChartRef} sx={{ width: '100%', height: '95%' }} />
                    </Paper>
                </Grid>

                <Grid item size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 4, width: '100%', boxSizing: 'border-box', height: 500 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Transactions per Account (Bar Chart)
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box ref={txnCountBarChartRef} sx={{ width: '100%', height: '95%' }} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home;