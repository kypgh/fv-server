import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
  }).route(async (req, res) => {
    let { page, limit } = req.query;
    let users = await usersService.getAllUsers({ page, limit });
    res.status(200).json({ users });
  })
);

export default router;
