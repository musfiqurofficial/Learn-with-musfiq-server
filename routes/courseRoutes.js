const express = require("express");
const Course = require("../models/Course");
const User = require("../models/User");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/courses", async (req, res) => {
  try {
    const { thumbnail, title, price, description } = req.body;
    const newCourse = new Course({ thumbnail, title, price, description });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
});

router.post("/courses/:courseId/modules", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const moduleNumber = String(course.modules.length + 1).padStart(2, "0");
    const newModule = { title, moduleNumber, lectures: [] };
    course.modules.push(newModule);
    await course.save();

    res.status(201).json(newModule);
  } catch (error) {
    res.status(500).json({ message: "Error adding module", error });
  }
});

router.post(
  "/courses/:courseId/modules/:moduleId/lectures",
  async (req, res) => {
    try {
      const { courseId, moduleId } = req.params;
      const { title, videoUrl, pdfUrls } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const module = course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      // Generate lecture number (e.g., 1.1, 1.2, etc.)
      const lectureNumber = `${module.moduleNumber}.${
        module.lectures.length + 1
      }`;
      const newLecture = { lectureNumber, title, videoUrl, pdfUrls };
      module.lectures.push(newLecture);
      await course.save();

      res.status(201).json(newLecture);
    } catch (error) {
      res.status(500).json({ message: "Error adding lecture", error });
    }
  }
);

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: "Error fetching course", error });
  }
});

router.get("/courses/:courseId/modules", async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course.modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules", error });
  }
});

router.delete("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    await Course.findByIdAndDelete(courseId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error });
  }
});

router.delete("/courses/:courseId/modules/:moduleId", async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.modules.pull(moduleId);
    await course.save();
    res.status(200).json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting module", error });
  }
});

// update module title
router.put("/courses/:courseId/modules/:moduleId", async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    module.title = title;
    await course.save();

    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: "Error updating module title", error });
  }
});

router.put(
  "/courses/:courseId/modules/:moduleId/lectures/:lectureId",
  async (req, res) => {
    try {
      const { courseId, moduleId, lectureId } = req.params;
      const { title, videoUrl } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const module = course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      const lecture = module.lectures.id(lectureId);
      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }

      if (title) lecture.title = title;
      if (videoUrl) lecture.videoUrl = videoUrl;

      await course.save();

      res.status(200).json(lecture);
    } catch (error) {
      console.error("Error updating lecture:", error);
      res.status(500).json({ message: "Error updating lecture", error });
    }
  }
);

// Enroll a user in a course
router.post("/courses/:courseId/enroll", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ message: "User already enrolled in this course" });
    }

    // Enroll the user
    user.enrolledCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: "Enrollment successful", course });
  } catch (error) {
    console.error("Error enrolling user:", error);
    res.status(500).json({ message: "Error enrolling user", error });
  }
});

// Get enrolled courses
router.get("/user-courses", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("enrolledCourses");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.enrolledCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/courses/:courseId/lectures/:lectureId/complete", authenticate, async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.user.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the lecture is already marked as completed
    if (user.completedLectures.includes(lectureId)) {
      return res.status(400).json({ message: "Lecture already marked as completed" });
    }

    // Mark the lecture as completed
    user.completedLectures.push(lectureId);
    await user.save();

    res.status(200).json({ message: "Lecture marked as completed" });
  } catch (error) {
    console.error("Error marking lecture as completed:", error);
    res.status(500).json({ message: "Error marking lecture as completed", error });
  }
});

router.get("/courses/:courseId/progress", authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Fetch the course and user
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: "Course or user not found" });
    }

    // Calculate total lectures in the course
    const totalLectures = course.modules.reduce((acc, module) => acc + module.lectures.length, 0);

    // Calculate completed lectures
    const completedLectures = user.completedLectures.filter((lectureId) =>
      course.modules.some((module) =>
        module.lectures.some((lecture) => lecture._id.toString() === lectureId.toString())
    ));

    // Calculate progress percentage
    const progressPercentage = (completedLectures.length / totalLectures) * 100;

    res.status(200).json({
      totalLectures,
      completedLectures: completedLectures.length,
      progressPercentage,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress", error });
  }
});

module.exports = router;
