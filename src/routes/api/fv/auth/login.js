import AdvancedHandler from "@lib/AdvancedServer/AdvancedHandler";
import AdvancedRouter from "@lib/AdvancedServer/AdvancedRouter";
import tsv from "type-standard-validator";
import { SECRET } from "config/envs";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import usersService from "services/users.service";
import refreshTokenService from "services/refreshToken.service";
import randomToken from "random-token";

const router = new AdvancedRouter();

router.POST(
  new AdvancedHandler({
    body: tsv.object({
      email: tsv.string(),
      password: tsv.string(),
    }),
  }).route(async (req, res) => {
    let secret = SECRET;
    const { email, password } = req.body;

    let user = await usersService.findUser(email);

    if (!user) {
      res.status(404).json({ message: "User does not exist!" });
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const jwtToken = sign(
        user.toJSON(), //valid for 30 seconds
        secret,
        { expiresIn: "10m" } //TODO: change to 10m
      );

      let rfToken = await refreshTokenService.checkIfTokenExists(user);

      if (rfToken) {
        await refreshTokenService.removeToken(rfToken);
      }

      let newRefreshToken = randomToken(16) + user._id.toString();

      let refTokenBody = {
        token: newRefreshToken,
        user: user,
      };

      let refreshToken = await refreshTokenService.createRefreshToken(
        refTokenBody
      );

      let response = { jwt: jwtToken, refreshToken: refreshToken.token };

      res.status(200).json({ message: response });
      return;
    }

    res.status(401).json({ message: "passwords do not match" });
  })
);

export default router;
