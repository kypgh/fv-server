import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import tsv from "type-standard-validator";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.middleware.all(isAuthenticated);

router.PATCH(
  new AdvancedHandler({
    body: tsv.object({
      oldPassword: tsv.string(),
      newPassword: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { newPassword, oldPassword } = req.body;
    await usersService.changePassword({
      oldPassword,
      newPassword,
      userId: req.user._id,
    });
    res.status(200).json({ message: "Password Changed" });
  })
);

export default router;
