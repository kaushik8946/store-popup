import React from 'react';
import { Home } from 'lucide-react';

const HomeView = () => {
    return (
        <div className="p-5 text-center text-secondary h-100 d-flex flex-column align-items-center justify-content-center">
            <h1 className="display-6 fw-bold">Store Operations Dashboard</h1>
            <Home size={80} className="text-light-subtle mt-4" />
        </div>
    );
};

export default HomeView;
