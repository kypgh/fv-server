import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY } from "./envs.js";

sgMail.setApiKey(SENDGRID_API_KEY);
export const SENDGRID_SENDER = "info@tiomarkets.com";
export default sgMail;
