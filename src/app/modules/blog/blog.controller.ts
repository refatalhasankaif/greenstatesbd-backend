import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { blogService } from "./blog.service";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await blogService.createBlog(req.body, req.user);

  sendResponse(res, {
    success: true,
    message: "Blog created successfully",
    data: result,
  }, status.CREATED);
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await blogService.getAllBlogs(req.query);

  sendResponse(res, {
    success: true,
    message: "Blogs retrieved",
    data: result,
  });
});

const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await blogService.getBlogById(id);

  sendResponse(res, {
    success: true,
    message: "Blog retrieved",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await blogService.updateBlog(
    id,
    req.body,
    req.user
  );

  sendResponse(res, {
    success: true,
    message: "Blog updated",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await blogService.deleteBlog(id, req.user);

  sendResponse(res, {
    success: true,
    message: "Blog deleted",
    data: result,
  });
});

const toggleBlockBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await blogService.toggleBlockBlog(
    id,
    req.body.isBlocked,
    req.user
  );

  sendResponse(res, {
    success: true,
    message: "Blog status updated",
    data: result,
  });
});

const getMyBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await blogService.getMyBlogs(req.user);

  sendResponse(res, {
    success: true,
    message: "My blogs retrieved",
    data: result,
  });
});

export const blogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlockBlog,
  getMyBlogs,
};