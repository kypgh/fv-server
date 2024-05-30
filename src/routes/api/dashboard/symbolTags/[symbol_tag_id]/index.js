import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import symbolTagsService from "services/symbolTags.service";
import isCrmUser from "middleware/isCrmUser";
import tsv from "type-standard-validator";
import { SYMBOL_TAGS_CATEGORIES } from "config/enums";
import { mongooseIdValidator } from "utils/validation";
import hasCRMUserPermissions from "middleware/hasCRMUserPermissions";
import { PERMISSIONS } from "config/permissions";

const router = new AdvancedRouter();

router.middleware.all(isCrmUser);
router.middleware.PUT(
  hasCRMUserPermissions(PERMISSIONS.SYMBOLTAGS.update_symboltag)
);

router.PUT(
  new AdvancedHandler({
    params: tsv.object({
      symbol_tag_id: tsv.string().custom(mongooseIdValidator),
    }),
    body: tsv.object({
      name: tsv.string(),
      category: tsv.string().whitelist(SYMBOL_TAGS_CATEGORIES),
    }),
  }).route(async (req, res) => {
    let { name, category } = req.body;
    let updatedSymbolTag = await symbolTagsService.updateSymbolTag({
      symbolTagId: req.params.symbol_tag_id,
      name,
      category,
    });
    res.status(200).json({ symbolTag: updatedSymbolTag });
  })
);

router.middleware.DELETE(
  hasCRMUserPermissions(PERMISSIONS.SYMBOLTAGS.delete_symboltag)
);

router.DELETE(
  new AdvancedHandler({
    params: tsv.object({
      symbol_tag_id: tsv.string().custom(mongooseIdValidator),
    }),
  }).route(async (req, res) => {
    let result = await symbolTagsService.deleteSymbolTag({
      symbolTagId: req.params.symbol_tag_id,
    });
    res.status(200).json({ message: result });
  })
);

export default router;
