import { type FormEvent, useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const LOGO = 'https://storage.googleapis.com/strapi-v2-bucket-prod/logo_white_d71075213d/logo_white_d71075213d.svg'

type Message = { id: number; content: string }

export default function App() {
  const [email, setEmail] = useState(() => localStorage.getItem('email') ?? '')
  const [welcome, setWelcome] = useState('Welcome!')

  async function ping(customerEmail: string) {
    setWelcome(`Welcome ${customerEmail.split('@')[0]}!`)
    const response = await fetch(`${API}/customer_api/ping`, {
      method: 'POST',
      body: new URLSearchParams({ email: customerEmail }),
    })
    const messages: Message[] = await response.json()

    for (const message of messages) {
      window.alert(message.content)
      await fetch(`${API}/customer_api/read`, {
        method: 'POST',
        body: new URLSearchParams({ message_id: String(message.id) }),
      })
    }
  }

  useEffect(() => {
    const storedEmail = localStorage.getItem('email')
    if (storedEmail) void ping(storedEmail)
  }, [])

  function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    localStorage.setItem('email', email)
    void ping(email)
  }

  return (
    <>
      <nav className="navbar">
        <div className="brand">
          <img src={LOGO} alt="Xsolla" width="120" height="25" />
          <span className="brand-label">Customer Website</span>
        </div>
        <form className="signup-form" onSubmit={signUp}>
          <label className="screen-reader-only" htmlFor="user-email">Email</label>
          <input
            id="user-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button type="submit">{localStorage.getItem('email') ? 'Switch User' : 'Sign Up'}</button>
        </form>
      </nav>

      <main>
        <section className="hero">
          <div className="container">
            <h1>{welcome}</h1>
            <p>
              This is a prototype of a customer's website. You can start by signing up in the upper left hand corner! From there check out the readme.
            </p>
          </div>
        </section>

        <section className="cards container">
          <article className="card">
            <h2>Structure</h2>
            <p>
              /customer-website is the page you are looking at. <a href="http://localhost:8011">/admin-website</a> is what the admin would see.
            </p>
            <p>Your framework will have a folder with its name and have 4 endpoints:</p>
            <ul>
              <li>POST /customer_api/ping (registers a customer and returns their unread messages)</li>
              <li>POST /customer_api/read (marks a message as read)</li>
              <li>GET /admin_api/users (lists all users)</li>
              <li>POST /admin_api/messages (creates a message for a user)</li>
            </ul>
            <p>Feel free to make any changes you need to the server or the front end!</p>
          </article>

          <article className="card">
            <h2>React</h2>
            <p>This site is a minimal React + TypeScript app built with Vite. It uses native browser APIs for storage and server requests.</p>
            <a className="button" href="https://react.dev" target="_blank" rel="noreferrer">Read me</a>
          </article>

          <article className="card">
            <h2>Styling</h2>
            <p>Plain CSS uses Xsolla UI (XUI) design variables in src/index.css. There is no CSS framework.</p>
          </article>
        </section>
      </main>
    </>
  )
}
