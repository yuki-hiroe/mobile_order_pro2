import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client'

import { Mobile2 } from './Mobile2';

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <Mobile2 />
    </StrictMode>
);