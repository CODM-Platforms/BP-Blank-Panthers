import { db } from './src/prisma/db.ts';
console.log("ORM KEYS:", Object.keys(db.orm));
console.log("PUBLIC KEYS:", db.orm.public ? Object.keys(db.orm.public) : "No public namespace");
