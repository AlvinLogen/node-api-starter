const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Get all active projects
router.get('/projects', async (req, res) => {
  try {
    const category = req.query.category;
    const featured = req.query.featured;
    
    const pool = await sql.connect();
    const request = pool.request();
    
    let query = `
      SELECT 
        ID,
        Title,
        Description,
        TechnologyStack,
        ProjectURL,
        GitHubURL,
        ImageURL,
        CreatedAt
      FROM Projects
      WHERE IsActive = 1
    `;
    
    // Add filters
    if (category && category !== 'all') {
      query += 'AND TechnologyStack LIKE @category';
      request.input('category', sql.NVarChar, `%${category}%`);
    }
    
    if (featured === 'true') {
      query += ' AND Featured = 1';
    }
    
    query += 'ORDER BY CreatedAt DESC';
    
    const result = await request.query(query);
    
    // Transform data for frontend
    const projects = result.recordset.map(project => ({
      id: project.ID,
      title: project.Title,
      description: project.Description,
      technologies: project.TechnologyStack ? project.TechnologyStack.split(',').map(t => t.trim()) : [],
      projectUrl: project.ProjectURL,
      githubUrl: project.GitHubURL,
      imageUrl: project.ImageURL || '/assets/images/project-placeholder.jpg',
      createdAt: project.CreatedAt
    }));
    
    res.json({
      success: true,
      data: projects,
      count: projects.length
    });
    
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching projects' 
    });
  }
});

// Get single project
router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID'
      });
    }
    
    const pool = await sql.connect();
    const request = pool.request();
    request.input('id', sql.Int, projectId);
    
    const result = await request.query(`
      SELECT * FROM Projects 
      WHERE ID = @id AND IsActive = 1
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const project = result.recordset[0];
    
    res.json({
      success: true,
      data: {
        id: project.ID,
        title: project.Title,
        description: project.Description,
        technologies: project.TechnologyStack ? project.TechnologyStack.split(',').map(t => t.trim()) : [],
        projectUrl: project.ProjectURL,
        githubUrl: project.GitHubURL,
        imageUrl: project.ImageURL,
        createdAt: project.CreatedAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching project' 
    });
  }
});

module.exports = router;