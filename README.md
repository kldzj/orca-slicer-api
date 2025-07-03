# OrcaSlicer API

A RESTful service that leverages the OrcaSlicer CLI to slice 3D models (STL, STEP, 3MF).

This project only provides an REST API to the OrcaSlicer CLI, full credit to the [OrcaSlicer](https://github.com/SoftFever/OrcaSlicer) contributors for the slicer itself.

## Features

- Slice models (STL, STEP, and 3MF) using OrcaSlicer and the profiles exported from it
- Export sliced models as a single G-code or 3MF (with G-code included) file, or as a ZIP file containing multiple G-code files
- Set parameters such as plate numbers, auto-arrange, auto-orient, filament, and more.

## Requirements 

- **Node.js** v22
- **OrcaSlicer** (tested on Linux with AppImage and MacOS)

## Installation

### Local

```bash
git clone https://github.com/AFKFelix/orca-slicer-api.git
cd orca-slicer-api

# Create a .env file in the project root:
# .env example
ORCASLICER_PATH=/your/path/OrcaSlicer
DATA_PATH=/your/path/data
ENV=dev
PORT=3000

# Install dependencies and start the dev server
npm install
npm run dev
```

## Configuration

`ORCASLICER_PATH` (required): Absolute path to the OrcaSlicer binary.\
`DATA_PATH` (required): Base directory for user uploaded profiles.\
`ENV` (required): Sets if run in development (dev) or production (prod)
`PORT` (optional): Port to run the server on, defaults to 3000.

Profiles are stored under:

```
<DATA_PATH>/
├── printers/
├── presets/
└── filaments/
```

Each profile is a JSON file from OrcaSlicer.

## Security

**WARNING**: No authentication or authorization is implemented. This service should never be exposed directly to the public internet without adding proper security layers.

## Roadmap

There are still several improvements planned:

- ~~Multi-plate slicing support~~ (added for 3MF files, returns ZIP of G-codes)
- ~~Enhanced slicing options~~
- ~~Improved error handling~~
- Better profile management system
- Strengthened security measures
- Additional quality-of-life features

Feedback is welcome!

## API Endpoints

You can check the Swagger file in the project root or go to /api-docs when running in development.
