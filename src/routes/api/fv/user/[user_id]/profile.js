import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let user = await usersService.getUserById({
      userId: req.params.user_id,
    });

    res.status(200).json({ user });
  })
);

export default router;
