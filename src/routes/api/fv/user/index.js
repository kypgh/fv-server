import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import tsv from "type-standard-validator";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.middleware.all(isAuthenticated);

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let user = req.user;
    res.status(200).json({ user });
  })
);

router.PATCH(
  new AdvancedHandler({
    body: tsv.object({
      description: tsv.string(),
      socialMediaLinks: tsv
        .array(
          tsv.object({
            name: tsv.string(),
            link: tsv.string(),
          })
        )
        .optional(),
      userName: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { description, socialMediaLinks, userName } = req.body;
    let user = await usersService.updateUserProfile({
      user: req.user._id,
      description,
      socialMediaLinks,
      userName,
    });
    res.status(200).json({ user });
  })
);

export default router;
