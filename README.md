# Meeting room booking

- Backend: https://github.com/aldask/meeting_room_backend
- Frontend: https://github.com/aldask/meeting_room_frontend

You need .NET 8 SDK and Node.js installed.

## Backend

```
git clone https://github.com/aldask/meeting_room_backend.git
cd meeting_room_backend
dotnet run --project meeting_room_backend --launch-profile http
```

It runs on http://localhost:5016. Swagger: http://localhost:5016/swagger

Tests:

```
dotnet test
```

## Frontend

In another terminal:

```
git clone https://github.com/aldask/meeting_room_frontend.git
cd meeting_room_frontend
npm install
npm run dev
```

Open http://localhost:5173

The backend must be running first.
