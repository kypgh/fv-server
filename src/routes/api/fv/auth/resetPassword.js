import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.PUT(
  new AdvancedHandler({
    body: tsv.object({
      fpToken: tsv.string(),
      password: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { fpToken, password } = req.body;
    let result = await usersService.resetPassword({ fpToken, password });
    res.status(200).json({ fpToken: result });
  })
);

export default router;
