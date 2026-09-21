# PicoChat

Welcome to PicoChat! A prototype Xsolla service. Inside this directory you'll find a customer website, an admin website and servers that represent a simplified version of how Xsolla works.

## Installation

Choose your preferred framework. The current choices available are:

```
go
node
python
```

Anywhere you see `{your-framework}` in the instructions below, replace it with the keyword above.

Run the command that matches your framework to install it.

```
# Mac/Linux/Windows with WSL (Windows Subsystem for Linux)
script/{your-framework}/setup

# Windows without WSL (Windows Subsystem for Linux)
script\{your-framework}\setup

(examples)

script/go/setup
script/node/setup
script/python/setup
```

The customer and admin websites are React + TypeScript apps and need Node.js with pnpm (`corepack enable pnpm` if you don't have it yet).

## Getting started

Open three terminals in the repository root. Run one command in each terminal.

On macOS, Linux, or Windows with WSL:

```sh
script/customer/start
script/admin/start
script/{your-framework}/start
```

In Windows Command Prompt, use the batch scripts:

```bat
script\customer\start.bat
script\admin\start.bat
script\{your-framework}\start.bat
```

Replace `{your-framework}` with `go`, `node`, or `python`.
If a Windows website script stops after installing packages, use the [pnpm workaround](TROUBLESHOOTING.md#pnpm-installs-packages-but-the-website-does-not-start-on-windows).

This will give you the following:

1. A customer webpage running at http://127.0.0.1:8010
2. An admin dashboard running at http://127.0.0.1:8011
3. An API webserver, used by the customer and admin pages, running at http://127.0.0.1:3001

## Sending a message

Open the [customer website](http://127.0.0.1:8010) and enter the email address `alice@example.com`, then click the **Sign up** button.

You'll see the welcome message update with the name `alice`, but nothing else will happen - don't worry.

Now open or refresh the [admin interface](http://127.0.0.1:8011) and you should see your user has been created.

Click on `alice@example.com` in the admin interface (you cannot manually enter the email) and send a message. Refresh the customer site and that message should appear in an alert.

## Troubleshooting

If you run across any issues while setting up PicoChat or while making your changes, make sure to check this [Troubleshooting page](TROUBLESHOOTING.md) for a list of some common problems.

## Structure

A quick overview of the application structure:

- **admin-website/** -- The admin interface. A minimal React + TypeScript app (Vite).
- **customer-website/** -- The customer's website. A minimal React + TypeScript app (Vite).

Your framework will have a folder with its name and have 4 endpoints:

- **POST /customer_api/ping** (registers a customer and returns their unread messages)
- **POST /customer_api/read** (marks a message as read)
- **GET /admin_api/users** (lists all users)
- **POST /admin_api/messages** (creates a message for a user)

## Folders

Each server framework is in its own folder (named after the framework) and has its own readme. You can safely ignore anything in the frameworks that you are not using.

- [Go](./go/README.md)
- [Node](./node/README.md)
- [Python](./python/README.md)

## Before your interview

Please set PicoChat up **before** your interview so we don't spend your session time on installs:

1. Pick one framework (`go`, `node` or `python`) and run its setup script.
2. Start all three parts (customer site, admin site, API) as described above.
3. Walk through the **Sending a message** flow once and make sure the alert shows up.

Setup normally takes 10-15 minutes. If anything fights you, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — and if it still doesn't work, bring what you have; debugging together is fair game.

The first 15 minutes of your interview is a **pairing session** on your machine: we check the app runs, you show us around your setup, and you get your actual task. The task itself is only shared during the session — all you need in advance is a working setup, your editor, and whatever AI tooling you normally use (AI assistants are not just allowed, they're expected).
