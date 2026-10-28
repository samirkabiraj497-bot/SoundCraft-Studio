const Project = require('../models/Project');

/**
 * @desc    Create a new project session
 * @route   POST /api/projects
 * @access  Private (JWT Required)
 */
const createProject = async (req, res, next) => {
  try {
    const { name, bpm, keySignature, tracksData, masterVolume } = req.body;
    const userId = req.user.id;

    const project = await Project.create({
      userId,
      name,
      bpm,
      keySignature,
      tracksData,
      masterVolume,
    });

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for the logged in user
 * @route   GET /api/projects
 * @access  Private
 */
const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await Project.findByUser(userId);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update project session (tracks, tempo, effects)
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, bpm, keySignature, tracksData, masterVolume, isPublic } = req.body;

    const updated = await Project.update(id, {
      ...(name && { name }),
      ...(bpm && { bpm: Number(bpm) }),
      ...(keySignature && { key_signature: keySignature }),
      ...(tracksData && { tracks_data: tracksData }),
      ...(masterVolume !== undefined && { master_volume: Number(masterVolume) }),
      ...(isPublic !== undefined && { is_public: Boolean(isPublic) }),
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Project not found to update.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project saved successfully.',
      project: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project session
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Project.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
