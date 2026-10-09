import { Request, Response, NextFunction } from "express";
import Class from "../models/Class";
import Assignment from "../models/Assignment";

export const resolveHubFromClass = async (req: Request, res: Response, next: NextFunction) => {
    const classId = req.params.classId;
    
    if (!classId) {
        res.status(400).json({ message: "Class ID required" });
        return;
    }

    try {
        const cls = await Class.findById(classId).select('hub');
        
        if (!cls) {
            res.status(404).json({ message: "Class not found" });
            return;
        }

        req.params.hubId = cls.hub.toString();
        next();
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};

export const resolveHubFromAssignment = async (req: Request, res: Response, next: NextFunction) => {
    // Some routes use :assignmentId, some use :id
    const assignmentId = req.params.assignmentId || req.params.id;
    
    if (!assignmentId) {
        res.status(400).json({ message: "Assignment ID required" });
        return;
    }

    try {
        const assignment = await Assignment.findById(assignmentId).select('hubId');
        
        if (!assignment) {
            res.status(404).json({ message: "Assignment not found" });
            return;
        }

        req.params.hubId = assignment.hub._id.toString();
        next();
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};
