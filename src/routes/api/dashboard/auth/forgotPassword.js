import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      email: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { email } = req.query;
    await usersService.forgotPassword({ email });
    res.status(200).json({ message: "email sent" });
  })
);

export default router;
