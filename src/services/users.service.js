import UserModel from "../models/users.js";
import UserFollowsUserModel from "models/userFollowsUser.js";
import randomToken from "random-token";
import sgMail from "config/sengrid.js";
import FpTokenModel from "../models/fpToken.js";
import EmailVerificationTokenModel from "models/emailVerificationToken.js";
import EmailChangeTokenModel from "models/emailChangeToken.js";
import { SENDGRID_SENDER } from "config/sengrid";
import { CHARACTERS } from "config/enums.js";
import bcrypt from "bcrypt";
import HTTPError from "utils/HTTPError.js";
import Mongoose from "mongoose";

const usersService = {
  createUser: async ({ email, password, fullName }) => {
    let userExists = await usersService.findUser(email);
    if (userExists) throw new HTTPError("User Already Exists", 409);

    let newUser = new UserModel({ email, password, fullName });
    await newUser.save();
    return newUser;
  },
  getUserById: async ({ userId }) => {
    // prettier-ignore
    const [user] = await UserModel.aggregate([
      { $match: { _id: new Mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: "userfollowsusers", localField: "_id", foreignField: "following", as: "followed_by", pipeline: [ { $lookup: { from: "users", localField: "follower", foreignField: "_id", as: "user", }, }, { $unwind: "$user" }, { $project: { _id: 0, following: { userName: "$user.userName", fullName: "$user.fullName", }, }, }, ], }, },
      { $lookup: { from: "posts", localField: "_id", foreignField: "author", as: "posts", pipeline: [ { $lookup: { from: "postlikes", localField: "_id", foreignField: "postId", as: "likes", }, }, { $project: { _id: 1, likes: { $size: "$likes" } } }, ], }, },
      { $project: { _id: 1, email: 1, fullName: 1, userName: 1, avatar: 1, description: 1, socialMediaLinks: 1, isVerified: 1, createdAt: 1, numberOfFollowers: { $size: "$followed_by" }, totalPostLikes: { $sum: "$posts.likes" }, }, },
    ]);

    return user;
  },
  findUser: async (email) => {
    return UserModel.findOne({ email });
  },
  findById: async (id) => {
    return UserModel.findById(id);
  },
  updateUserProfile: async ({
    user,
    description,
    socialMediaLinks,
    userName,
  }) => {
    return UserModel.findByIdAndUpdate(
      user,
      {
        description,
        socialMediaLinks,
        userName,
      },
      { returnDocument: "after", select: { password: 0 } }
    );
  },
  forgotPassword: async ({ email }) => {
    let fpToken = randomToken(16);
    let user = await usersService.findUser(email);
    FpTokenModel.create({ user, token: fpToken });
    let msg = {
      to: email,
      from: SENDGRID_SENDER,
      subject: "Forgot Password",
      text: fpToken,
    };

    sgMail.send(msg);

    return;
  },
  resetPassword: async ({ fpToken, password }) => {
    let fpTokenDoc = await FpTokenModel.findOne({ token: fpToken });
    if (!fpTokenDoc) throw new Error("FP Token not found");
    let user = await usersService.findById(fpTokenDoc.user);
    user.password = await bcrypt.hash(password, 12);
    await user.save();
    await fpTokenDoc.deleteOne();
    return user;
  },
  sendEmailVerification: async ({ user }) => {
    let tokenLength = 10;
    let token = randomToken(tokenLength, CHARACTERS);

    if (user?.emailVerified) throw new HTTPError("Email Already Verified", 409);

    await EmailVerificationTokenModel.create({ user, token });

    let msg = {
      to: user.email,
      from: SENDGRID_SENDER,
      subject: "Email Verification",
      text: token,
    };

    sgMail.send(msg);
    return;
  },
  verifyEmail: async ({ token }) => {
    let emailVerificationTokenDoc = await EmailVerificationTokenModel.findOne({
      token,
    });

    if (!emailVerificationTokenDoc)
      throw new HTTPError("Invalid Email Verification Token", 400);

    let user = await usersService.findById(emailVerificationTokenDoc.user);

    if (!emailVerificationTokenDoc) throw new HTTPError("invalid token", 400);
    if (user?.isVerified) throw new HTTPError("Email Already Verified", 409);
    user.isVerified = true;
    await user.save();
    //TODO: SHOULD I DELETE THE TOKEN?
    await emailVerificationTokenDoc.deleteOne();
    return;
  },
  changePassword: async ({ newPassword, oldPassword, userId }) => {
    let userDoc = await usersService.findById(userId);
    if (!userDoc) throw new HTTPError("User not found", 404);
    let match = await userDoc.comparePassword(oldPassword);
    if (!match) throw new HTTPError("Old Password is Incorrect", 400);
    userDoc.password = await bcrypt.hash(newPassword, 12);
    return userDoc.save();
  },
  createChangeEmailToken: async ({ userId, email, password }) => {
    let tokenLength = 10;
    let token = randomToken(tokenLength, CHARACTERS);
    let user = await usersService.findById(userId);
    if (!user) throw new HTTPError("User not found", 404);
    let match = await user.comparePassword(password);
    if (!match) throw new HTTPError("Wrong Password", 400);
    let emailAlreadyExists = await usersService.findUser(email);
    if (emailAlreadyExists) throw new HTTPError("Email Already Exists", 409);

    let msg = {
      to: user.email,
      from: SENDGRID_SENDER,
      subject: "Email Change Request",
      text: token,
    };

    sgMail.send(msg);

    let emailChangeTokenDoc = await EmailChangeTokenModel.findOne({
      user,
    });

    if (emailChangeTokenDoc) {
      emailChangeTokenDoc.token = token;
      emailChangeTokenDoc.email = email;
      emailChangeTokenDoc.password = password;
      return emailChangeTokenDoc.save();
    }

    return EmailChangeTokenModel.create({ user, token, email, password });
  },
  changeEmail: async ({ token }) => {
    let emailChangeTokenDoc = await EmailChangeTokenModel.findOne({
      token,
    });

    if (!emailChangeTokenDoc) throw new HTTPError("Invalid Token", 400);

    let user = await usersService.findById(emailChangeTokenDoc.user);

    user.email = emailChangeTokenDoc.email;
    await user.save();

    return emailChangeTokenDoc.deleteOne();
  },
  followUser: async ({ following, follower }) => {
    let userFollowsUserDoc = await UserFollowsUserModel.findOne({
      following,
      follower,
    });

    if (userFollowsUserDoc) {
      await userFollowsUserDoc.deleteOne();
      return ` ${follower} unfollowed ${following}`;
    } else {
      await UserFollowsUserModel.create({ following, follower });
      return ` ${follower} followed ${following}`;
    }
  },
  uploadAvatar: async ({ user, image }) => {
    let userDoc = await usersService.findById(user);
    userDoc.avatar = image;
    return userDoc.save();
  },
  getAllUsers: async ({ page = 1, limit = 10, sort }) => {
    let query = [
      {
        $lookup: {
          from: "userfollowsusers",
          localField: "_id",
          foreignField: "following",
          as: "follower_by",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "follower",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
            {
              $project: {
                _id: 0,
                following: {
                  userName: "$user.userName",
                  fullName: "$user.fullName",
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "author",
          as: "posts",
        },
      },
      {
        $addFields: {
          followers: {
            $size: "$follower_by",
          },
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          fullName: 1,
          userName: 1,
          avatar: 1,
          description: 1,
          socialMediaLinks: 1,
          isVerified: 1,
          followers: 1,
          createdAt: 1,
          posts: {
            $size: "$posts",
          },
        },
      },
    ];

    if (sort) {
      sort = sort.split(":");

      query.push({
        $sort: {
          [sort[0]]: sort[1] === "asc" ? 1 : -1,
        },
      });
    }

    let aggregate = UserModel.aggregate(query);

    return UserModel.aggregatePaginate(aggregate, {
      page: page,
      limit: limit,
    });
  },
  getFollowers: async ({ userId, page = 1, limit = 10 }) => {
    let aggregate = UserFollowsUserModel.aggregate([
      {
        $match: { following: new Mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          _id: "$user._id",
          userName: "$user.userName",
          fullName: "$user.fullName",
          avatar: "$user.avatar",
          isVerified: "$user.isVerified",
          createdAt: "$user.createdAt",
          description: "$user.description",
          socialMediaLinks: "$user.socialMediaLinks",
        },
      },
    ]);

    return UserFollowsUserModel.aggregatePaginate(aggregate, {
      page: page,
      limit: limit,
    });
  },
  getFollowing: async ({ userId, page = 1, limit = 10 }) => {
    let aggregate = UserFollowsUserModel.aggregate([
      {
        $match: { follower: new Mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          _id: "$user._id",
          userName: "$user.userName",
          fullName: "$user.fullName",
          avatar: "$user.avatar",
          isVerified: "$user.isVerified",
          createdAt: "$user.createdAt",
          description: "$user.description",
          socialMediaLinks: "$user.socialMediaLinks",
        },
      },
    ]);

    return UserFollowsUserModel.aggregatePaginate(aggregate, {
      page: page,
      limit: limit,
    });
  },
};

export default usersService;
