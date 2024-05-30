import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.middleware.PUT(isAuthenticated);

router.PUT(
  new AdvancedHandler().route(async (req, res) => {
    let following = req.params.user_id;
    let follower = req.user._id;
    let result = await usersService.followUser({ following, follower });
    res.status(200).json({ message: result });
  })
);

export default router;
