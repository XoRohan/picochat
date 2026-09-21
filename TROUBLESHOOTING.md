# Troubleshooting

If you find your PicoChat setup is not working correctly below you may find some resolutions to some common problems others have had:

## Admin and Customer 404 pages on Windows

`start.bat` Windows users, if you find that the customer or admin scripts are running correctly but their pages are showing 404s you are possibly running the scripts from the wrong directory. **Please make sure to run the `script\admin\start` and `script\customer\start` scripts from the project root.**

## `pnpm: command not found`

The customer and admin websites (and the node framework) use pnpm. If you have a recent Node.js installed, enable it with:

```
corepack enable pnpm
```

Otherwise install the Node LTS from https://nodejs.org/ first.

## pnpm installs packages but the website does not start on Windows

On Windows, `pnpm` normally runs through `pnpm.cmd`. A batch script must use `call pnpm install` to continue to its next command.
Without `call`, installation can finish without starting the website.

If this happens, start the websites directly. Open two Command Prompt windows in the repository root.
In the first window, run:

```bat
cd customer-website
pnpm install && pnpm dev
```

In the second window, run:

```bat
cd admin-website
pnpm install && pnpm dev
```

Keep the API server running in a third window.

## `python3 command not recognized` on Windows

In some versions of Windows Python 3 doesn't get installed with a `python3` executable. To resolve quickly you can just follow the advice in [this Stackoverflow question](https://stackoverflow.com/a/60597491/323999).

## Port already in use

Each part of the app needs its port free: 8010 (customer), 8011 (admin) and 3001 (API). If a start script fails with an "address already in use" error, stop whatever is holding that port or export `PORT` (API) before starting.
