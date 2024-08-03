import { User } from '../models/User.js';

export const profile = async (req, res) => new User(req, res).profile();
export const reset = async (req, res) => new User(req, res).reset();
export const isAdmin = async (req, res) => new User(req, res).isAdmin();