import { IconCalendarEvent, IconChartBar, IconDoor, IconUsers } from '@tabler/icons-react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import classes from './App.module.css'
import ReservationsPage from './pages/ReservationsPage'
import RoomsPage from './pages/RoomsPage'
import UsagePage from './pages/UsagePage'
import UsersPage from './pages/UsersPage'

const links = [
  { to: '/rooms', label: 'Rooms', icon: IconDoor },
  { to: '/reservations', label: 'Reservations', icon: IconCalendarEvent },
  { to: '/users', label: 'Users', icon: IconUsers },
  { to: '/usage', label: 'Usage report', icon: IconChartBar },
]

export default function App() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.headerInner}>
          <NavLink to="/rooms" className={classes.brand}>
            <IconCalendarEvent size={24} />
            Meeting Rooms
          </NavLink>

          <nav className={classes.nav}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink)}
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={classes.main}>
        <Routes>
          <Route path="/" element={<Navigate to="/rooms" replace />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/usage" element={<UsagePage />} />
        </Routes>
      </main>
    </>
  )
}
