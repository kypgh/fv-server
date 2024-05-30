import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import symbolTagsService from "services/symbolTags.service";
import isCrmUser from "middleware/isCrmUser";
import tsv from "type-standard-validator";
import { SYMBOL_TAGS_CATEGORIES } from "config/enums";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();
router.middleware.all(isCrmUser);

router.middleware.GET(
  hasCRMUserPermissions(PERMISSIONS.SYMBOLTAGS.view_symboltags)
);

router.GET(
  new AdvancedHandler({}).route(async (req, res) => {
    let { search } = req.query;
    let symbolTags = await symbolTagsService.getAllSymbolTags();
    res.status(200).json({ symbolTags });
  })
);

router.middleware.POST(
  hasCRMUserPermissions(PERMISSIONS.SYMBOLTAGS.create_symboltag)
);

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      name: tsv.string(),
      category: tsv.string().whitelist(SYMBOL_TAGS_CATEGORIES),
    }),
  }).route(async (req, res) => {
    let { name, category } = req.body;

    let symbolTag = await symbolTagsService.createSymbolTag({
      name,
      category,
    });

    res.status(200).json({ symbolTag });
  })
);

router.middleware.PUT([isCrmUser]);

export default router;
