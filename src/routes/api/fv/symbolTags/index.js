import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import isAuthenticated from "middleware/isAuthenticated";
import tsv from "type-standard-validator";
import symbolTagsService from "services/symbolTags.service";

const router = new AdvancedRouter();

router.GET(
  new AdvancedHandler({
    query: tsv.object({
      search: tsv.string().optional(),
    }),
  }).route(async (req, res) => {
    let { search } = req.query;
    let result = await symbolTagsService.searchTags({ search });
    res.status(200).json({ result });
  })
);

export default router;
