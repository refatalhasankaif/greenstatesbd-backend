import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { bidService } from "./bid.service";

const createBid = catchAsync(async (req: Request, res: Response) => {
  const result = await bidService.createBid(req.body, req.user);

  sendResponse(
    res,
    {
      success: true,
      message: "Bid placed successfully",
      data: result,
    },
    status.CREATED
  );
});

const getMyBids = catchAsync(async (req: Request, res: Response) => {
  const result = await bidService.getMyBids(req.user);

  sendResponse(
    res,
    {
      success: true,
      message: "My bids retrieved",
      data: result,
    },
    status.OK
  );
});

const getBidsByProperty = catchAsync(async (req: Request, res: Response) => {
  const propertyId = req.params.id as string;

  const result = await bidService.getBidsByProperty(propertyId);

  sendResponse(
    res,
    {
      success: true,
      message: "Bids retrieved",
      data: result,
    },
    status.OK
  );
});

const closeBidding = catchAsync(async (req: Request, res: Response) => {
  const propertyId = req.params.id as string;

  const result = await bidService.closeBidding(propertyId);

  sendResponse(
    res,
    {
      success: true,
      message: "Bidding closed successfully",
      data: result,
    },
    status.OK
  );
});

export const bidController = {
  createBid,
  getMyBids,
  getBidsByProperty,
  closeBidding,
};