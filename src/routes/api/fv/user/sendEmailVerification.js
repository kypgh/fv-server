import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import usersService from "services/users.service";
import isAuthenticated from "middleware/isAuthenticated";
import HTTPError from "utils/HTTPError";

const router = new AdvancedRouter();
router.middleware.all(isAuthenticated);

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let user = req.user;
    await usersService.sendEmailVerification({
      user,
    });
    res.status(200).json({ message: "Verification Email Sent" });
  })
);

export default router;
