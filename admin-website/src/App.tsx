import { type FormEvent, useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const LOGO = 'https://storage.googleapis.com/strapi-v2-bucket-prod/logo_white_d71075213d/logo_white_d71075213d.svg'

type User = { id: number; email: string }
type ErrorResponse = { error?: string }

export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    void fetch(`${API}/admin_api/users`)
      .then((response) => response.json())
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch(`${API}/admin_api/messages`, {
      method: 'POST',
      body: new URLSearchParams({ email, content }),
    })

    if (response.status === 404) {
      const result: ErrorResponse = await response.json()
      window.alert(result.error ?? 'User not found')
      return
    }

    if (response.ok) setContent('')
  }

  return (
    <>
      <nav className="navbar">
        <div className="brand">
          <img src={LOGO} alt="Xsolla" width="120" height="25" />
          <span className="brand-label">Admin Website</span>
        </div>
      </nav>

      <main className="container">
        <h1>All Users</h1>
        <div className="layout">
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id}>
                <button type="button" className="user-row" onClick={() => setEmail(user.email)}>{user.email}</button>
              </li>
            ))}
          </ul>

          <form className="composer" onSubmit={sendMessage}>
            <label htmlFor="message-receiver">To:</label>
            <input
              id="message-receiver"
              type="text"
              value={email}
              placeholder="Select a user from your user list"
              readOnly
            />
            <label htmlFor="message-content">Message:</label>
            <textarea
              id="message-content"
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <button className="send" type="submit">Send</button>
          </form>
        </div>
      </main>
    </>
  )
}
