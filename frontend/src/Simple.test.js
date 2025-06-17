import { render, screen } from '@testing-library/react';
import React from 'react';

function Hello() {
    return <h1>Hello Test</h1>;
}

test('renders Hello Test', () => {
    render(<Hello />);
    const heading = screen.getByText(/Hello Test/i);
    expect(heading).toBeInTheDocument();
});
