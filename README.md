# OrcaSlicer API

A RESTful service that leverages the OrcaSlicer CLI to slice 3D models (STL, STEP, 3MF).

This project only provides an REST API to the OrcaSlicer CLI, full credit to the [OrcaSlicer](https://github.com/SoftFever/OrcaSlicer) contributors for the slicer itself.

## Requirements 

- **Node.js** v22
- **OrcaSlicer** (tested on Unix with AppImage)

## Installation

### Local

```bash
git clone https://github.com/AFKFelix/orca-slicer-api.git
cd orca-slicer-api

# Create a .env file in the project root:
# .env example
ORCASLICER_PATH=/your/path/OrcaSlicer
DATA_PATH=/your/path/data

# Install dependencies and start the dev server
npm install
npm run dev
```

## Configuration

`ORCASLICER_PATH` (required): Absolute path to the OrcaSlicer binary.\
`DATA_PATH` (required): Base directory for user uploaded profiles.

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

- Multi-plate slicing support
- Enhanced slicing options
- Improved error handling
- Better profile management system
- Strengthened security measures
- Additional quality-of-life features

Feedback is welcome!

## API Endpoints

### 1. Profiles

Manage printer, preset and filament profiles.

#### POST `/profiles/:category`

- **Description**: Upload a new profile.
- **Path Parameter**:

  - `:category` — one of `printers`, `presets`, `filaments`

- **Form Data**:

  - `file` — JSON file containing the profile
  - `name` — alphanumeric identifier

#### GET `/profiles/:category`

- **Description**: List all available profile names in the given category.

#### GET `/profiles/:category/:name`

- **Description**: Retrieve a specific profile by name.

---

### 2. Slicing

Perform slicing on an uploaded 3D model.

#### POST `/slice`

- **Description**: Slice a 3D model and return the generated G-code.
- **Form Data**:

  - `file` — the model file (STL, STEP, 3MF).
  - `printer` (string) — profile name under `printers`.
  - `preset` (string) — profile name under `presets`.
  - `filament` (string) — profile name under `filaments`.
  - `bedType` (string) — bed type identifier.

- **Process**:

  1. Create a temporary workspace.
  2. Save the uploaded model.
  3. Slice model using OrcaSlicer CLI.
  4. Stream the first `.gcode` file back to the client.
  5. Clean up temporary directories.
