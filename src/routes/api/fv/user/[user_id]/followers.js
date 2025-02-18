import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import usersService from "services/users.service";
import tsv from "type-standard-validator";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      page: tsv.number().optional(),
      limit: tsv.number().optional(),
    }),
    params: tsv.object({
      user_id: tsv.string(),
    }),
  }).route(async (req, res) => {
    let followers = await usersService.getFollowers({
      userId: req.params.user_id,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({ followers });
  })
);

export default router;
