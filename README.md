# \# Sweety Glucose Tracker

# 

# A full-stack web application that allows users to securely record, manage, and monitor their blood glucose readings.

# 

# \## Features

# 

# \- User registration and login

# \- Secure password hashing using bcrypt

# \- JWT-based authentication

# \- Add, view, edit, and delete glucose readings

# \- Record readings for four daily slots:

# &#x20; - Morning fasting

# &#x20; - After breakfast

# &#x20; - After lunch

# &#x20; - After dinner

# \- Prevent duplicate readings for the same date and slot

# \- Validate glucose values between 40 and 600 mg/dL

# \- Daily glucose reports

# \- Month-to-date reports

# \- Previous-month reports

# \- Highest, lowest, and average glucose statistics

# \- User-specific reading access

# 

# \## Technology Stack

# 

# \*\*Frontend\*\*

# \- React.js

# \- Vite

# \- JavaScript

# \- CSS

# 

# \*\*Backend\*\*

# \- Node.js

# \- Express.js

# \- PostgreSQL

# \- JWT Authentication

# \- bcrypt

# 

# \*\*Tools\*\*

# \- Git and GitHub

# \- Postman

# \- VS Code

# 

# \## Project Structure

# 

# ```text

# sweety-glucose-tracker/

# │

# ├── client/

# │   ├── public/

# │   ├── src/

# │   │   ├── assets/

# │   │   ├── App.jsx

# │   │   ├── App.css

# │   │   ├── index.css

# │   │   └── main.jsx

# │   └── package.json

# │

# ├── server/

# │   ├── config/

# │   ├── controllers/

# │   ├── middleware/

# │   ├── models/

# │   ├── routes/

# │   ├── seed/

# │   ├── tests/

# │   ├── app.js

# │   ├── server.js

# │   └── package.json

# │

# └── README.md

# ```

# 

# \## Prerequisites

# 

# Install the following before running the application:

# 

# \- Node.js and npm

# \- PostgreSQL

# \- Git

# 

# \## Installation and Setup

# 

# \### 1. Clone the repository

# 

# ```bash

# git clone https://github.com/dhanisirieswar/gulcose-tracker.git

# cd gulcose-tracker

# ```

# 

# \### 2. Configure the database

# 

# Create a PostgreSQL database named:

# 

# ```sql

# CREATE DATABASE sweety\_tracker;

# ```

# 

# Create the `users` and `glucose\_readings` tables using the SQL schema provided in the project setup.

# 

# \### 3. Configure backend environment variables

# 

# Create a `.env` file inside the `server` folder.

# 

# ```env

# PORT=5000

# DB\_USER=your\_postgres\_username

# DB\_PASSWORD=your\_postgres\_password

# DB\_HOST=localhost

# DB\_PORT=5432

# DB\_NAME=sweety\_tracker

# JWT\_SECRET=your\_secure\_jwt\_secret

# ```

# 

# Use your own local PostgreSQL credentials. Never commit your `.env` file.

# 

# \### 4. Start the backend

# 

# ```bash

# cd server

# npm install

# npm run dev

# ```

# 

# Backend runs at:

# 

# `http://localhost:5000`

# 

# \### 5. Seed demo data

# 

# Open another terminal:

# 

# ```bash

# cd server

# npm run seed

# ```

# 

# Demo login:

# 

# \- Email: demo@sweetytracker.com

# \- Password: Demo@12345

# 

# \### 6. Start the frontend

# 

# Open another terminal:

# 

# ```bash

# cd client

# npm install

# npm run dev

# ```

# 

# Open the local URL displayed by Vite, usually:

# 

# `http://localhost:5173`

# 

# \## API Endpoints

# 

# \### Authentication

# 

# | Method | Endpoint | Description |

# |---|---|---|

# | POST | `/api/auth/signup` | Register a user |

# | POST | `/api/auth/login` | Login a user |

# 

# \### Glucose Readings

# 

# | Method | Endpoint | Description |

# |---|---|---|

# | POST | `/api/readings` | Add a reading |

# | GET | `/api/readings` | Get user readings |

# | GET | `/api/readings/:id` | Get a reading |

# | PUT | `/api/readings/:id` | Update a reading |

# | DELETE | `/api/readings/:id` | Delete a reading |

# 

# \### Reports

# 

# | Method | Endpoint | Description |

# |---|---|---|

# | GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |

# | GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |

# | GET | `/api/reports/previous-month` | Previous-month report |

# 

# Protected endpoints require a JWT access token in the Authorization header:

# 

# `Authorization: Bearer YOUR\_TOKEN`

# 

# \## Validation Rules

# 

# \- All required fields must be provided.

# \- Glucose readings must be integers between 40 and 600 mg/dL.

# \- Future dates are not allowed.

# \- Only four supported reading slots are accepted.

# \- Duplicate readings for the same user, date, and slot are not allowed.

# \- Users can access only their own glucose readings.

# 

# \## Testing

# 

# Test the application locally by checking:

# 

# \- User signup and login

# \- Invalid login credentials

# \- Adding valid and invalid readings

# \- Editing and deleting readings

# \- Duplicate reading prevention

# \- User-specific data access

# \- Daily and monthly reports

# \- Empty report results

# 

# API endpoints can also be tested using Postman.

# 

# \## Assumptions and Future Improvements

# 

# \- Glucose readings are recorded in mg/dL.

# \- Each user can record one reading per supported slot per day.

# \- The application provides tracking and reporting functionality, not medical diagnosis.

# \- Future improvements may include graphical glucose trends, pagination, reminders, and downloadable reports.

# 

# \## Author

# 

# Dhanisiri Eswar

# 

# GitHub: https://github.com/dhanisirieswar



