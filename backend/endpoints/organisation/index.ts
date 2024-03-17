import { Router } from "express";
import bodyParser from "body-parser";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";
import httpStatus from "http-status";

import ctx from "@context";
import middlewares from "@middlewares";

const router = Router();

/**
 * Add a user to an organisation.
 *
 * In a real world implementation, we would check if the user is allowed to join the organisation
 * but also an invitation system with notification etc...
 * Unfortunately, we don't have time to implement a production ready organisation system :)
 *
 * We would also check if the users wallet is correctly setup in the Circle API.
 */
router.post(
  "/:organisationID/add",
  middlewares.isLoggedIn,
  bodyParser.json(),
  validateRequest({
    body: z.object({
      userID: z.string().min(1, { message: "userID is required." }),
    }),
  }),
  async (req, res, next) => {
    const { userID } = req.body;

    const organisationID = req.params.organisationID;
    if (!organisationID) {
      return next(new Error("field organisationID is missing from URL."));
    }

    try {
      const organisation = await ctx.prisma.organisation.findFirst({ where: { id: Number(organisationID) } });
      if (!organisation?.id) {
        return next(new Error(`organisation ${organisationID} not found.`));
      }

      await ctx.prisma.organisation.update({
        where: { id: organisation.id },
        data: { users: { connect: [{ id: userID }] } },
      });

      return res.status(httpStatus.OK).json({ message: "User joined organisation!", organisation });
    } catch (error) {
      return next(new Error("could not join organisation.", { cause: error }));
    }
  }
);

/**
 * Create a new organisation.
 *
 * In a real world application, we would check if the user is allowed to create an organisation.
 * We could also add more metadata related to the organisation, such as the address, the industry, etc...
 *
 * The users shall also have a valid wallet on Circle API before performing this operation.
 */
router.post(
  "",
  middlewares.isLoggedIn,
  bodyParser.json(),
  validateRequest({
    body: z.object({
      name: z.string().min(1, { message: "name is required." }),
    }),
  }),
  async (req, res, next) => {
    const { name } = req.body;

    let challengeID: string;
    try {
      challengeID = await ctx.contractSDK.ownContract(
        {
          walletID: req.session.walletID as string,
          userToken: req.session.userToken as string,
        },
        {
          walletAddress: req.session.walletAddress as string,
        }
      );
    } catch (error) {
      return next(new Error("could not transfer contract ownership.", { cause: error }));
    }

    try {
      const organisation = await ctx.prisma.organisation.create({
        data: { name: name, users: { connect: [{ id: req.session.userID }] } },
      });

      return res.status(httpStatus.CREATED).json({ message: "Organisation created!", organisation, challengeID });
    } catch (error) {
      return next(new Error("could not create organisation.", { cause: error }));
    }
  }
);

/**
 * Get an organisation by its ID.
 */
router.get("/:organisationID", middlewares.isLoggedIn, async (req, res, next) => {
  const organisationID = req.params.organisationID;
  if (!organisationID) {
    return next(new Error("field organisationID is missing from request body."));
  }

  try {
    const organisation = await ctx.prisma.organisation.findFirst({
      where: { id: Number(organisationID) },
      include: { groups: true, users: true },
    });
    if (!organisation?.id) {
      return next(new Error(`organisation ${organisationID} not found.`));
    }

    return res.status(httpStatus.OK).json({ message: "Organisation found!", organisation });
  } catch (error) {
    return next(new Error("could not find organisation.", { cause: error }));
  }
});

export default router;
