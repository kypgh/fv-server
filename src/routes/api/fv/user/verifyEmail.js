import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import tsv from "type-standard-validator";
import branchingTagsService from "services/branchingTags.service";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.middleware.all(isAuthenticated);

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      emailVerificationToken: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { emailVerificationToken } = req.query;
    await usersService.verifyEmail({
      token: emailVerificationToken,
    });
    res.status(200).json({ message: "Email Verified" });
  })
);

export default router;
