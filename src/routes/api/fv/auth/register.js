import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import usersService from "services/users.service";
import bcrypt from "bcrypt";

const router = new AdvancedRouter();

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      email: tsv.string(),
      password: tsv.string(),
      confirmPassword: tsv.string(),
      fullName: tsv.string(),
    }),
  }).route(async (req, res) => {
    let { email, password, fullName } = req.body;
    password = await bcrypt.hash(password, 12);
    let newUser = await usersService.createUser({
      email,
      password,
      fullName,
    });
    res.status(200).json({ message: newUser });
  })
);

export default router;
