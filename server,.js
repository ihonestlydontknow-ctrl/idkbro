const express = require("express");
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

const keys = {};
const ADMIN_SECRET = "olivia6767";

// headset submits its generated code — goes into pending state
app.post("/register/:key", (req, res) => {
    const key = req.params.key.toUpperCase();
    if (!keys[key]) {
        keys[key] = {
            approved: false,
            active: false,
            owner: req.body.owner || "unknown",
            submitted: new Date().toISOString()
        };
    }
    res.json({ status: "pending" });
});

// headset polls this to check if approved
app.get("/check/:key", (req, res) => {
    const entry = keys[req.params.key.toUpperCase()];
    if (!entry || !entry.approved || !entry.active) {
        return res.json({ valid: false });
    }
    res.json({ valid: true });
});

// admin — approve a pending key
app.post("/admin/approve/:key", (req, res) => {
    if (req.headers["x-admin-secret"] !== ADMIN_SECRET)
        return res.status(403).json({ error: "no" });
    const key = req.params.key.toUpperCase();
    if (keys[key]) {
        keys[key].approved = true;
        keys[key].active = true;
        return res.json({ approved: true });
    }
    res.json({ approved: false, error: "key not found" });
});

// admin — revoke
app.post("/admin/revoke/:key", (req, res) => {
    if (req.headers["x-admin-secret"] !== ADMIN_SECRET)
        return res.status(403).json({ error: "no" });
    const key = req.params.key.toUpperCase();
    if (keys[key]) {
        keys[key].active = false;
        return res.json({ revoked: true });
    }
    res.json({ revoked: false });
});

// admin — list all pending + approved
app.get("/admin/list", (req, res) => {
    if (req.headers["x-admin-secret"] !== ADMIN_SECRET)
        return res.status(403).json({ error: "no" });
    res.json(keys);
});

app.listen(3000, () => console.log("running"));
