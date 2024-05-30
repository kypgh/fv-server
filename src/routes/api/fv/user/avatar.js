import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import upload from "config/multer_config";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.middleware.PUT([isAuthenticated, upload.array("image", 1)]);

//TODO: add validation
router.PUT(
  new AdvancedHandler({}).route(async (req, res) => {
    let image = req.files[0].location;

    let user = await usersService.uploadAvatar({
      user: req.user._id,
      image,
    });

    res.status(200).json({ user });
  })
);

export default router;
