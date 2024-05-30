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
      email: tsv.string(),
      password: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { email, password } = req.body;

    await usersService.createChangeEmailToken({
      email,
      password,
      userId: req.user._id,
    });

    res.status(200).json({ message: "Email Changed Request Send" });
  })
);

export default router;
