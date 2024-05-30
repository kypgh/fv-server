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
      token: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { token } = req.body;

    await usersService.changeEmail({
      token,
    });
    res.status(200).json({ message: "Email Changed" });
  })
);

export default router;
