import { Request, Response } from "express";
import Assignment from "../models/Assignment";
import Hub from "../models/Hub";

// Extend Request type to avoid TypeScript errors with req.user
interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

export const createAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, dueDate, totalPoints, type, hubId, targetClasses } = req.body;
        
        // Safely parse classes (if sent as a JSON string from FormData)
        let classesArray: string[] = [];
        if (targetClasses) {
            try {
                classesArray = JSON.parse(targetClasses);
            } catch (e) {
                classesArray = Array.isArray(targetClasses) ? targetClasses : [targetClasses];
            }
        }

        // Handle uploaded file via Cloudinary (req.file)
        const attachments = req.file ? [req.file.filename] : []; // filename is usually the Cloudinary URL or path

        const assignment = new Assignment({
            title,
            description,
            dueDate,
            totalPoints: totalPoints || 100,
            type: type || "assignment",
            hub: hubId, 
            classes: classesArray,
            teacher: req.user.userId,
            attachments
        });

        const savedAssignment = await assignment.save();

        res.status(201).json({
            message: "Assignment created successfully",
            assignment: savedAssignment
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};

export const getAssignmentsByHub = async (req: Request, res: Response) => {
    try {
        const { hubId } = req.params;
        const assignments = await Assignment.find({ hub: hubId })
            .populate("teacher", "username email")
            .populate("classes", "title")
            .sort({ dueDate: 1 }); // Sort by closest due date
        
        res.status(200).json(assignments);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};

export const getAssignmentById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id)
            .populate("teacher", "username email")
            .populate("classes", "title");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        res.status(200).json(assignment);
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};
