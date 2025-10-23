USE master;
GO

IF NOT EXISTS(SELECT name FROM sys.databases WHERE name = 'PortfolioDB')
BEGIN
    CREATE DATABASE PortfolioDB;
END
GO

USE PortfolioDB;
GO

--Contact form submissions
CREATE TABLE ContactSubmissions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20),
    Subject NVARCHAR(100),
    Message NTEXT NOT NULL,
    SubmittedAt DATETIME2 DEFAULT GETDATE(),
    IsRead BIT DEFAULT 0

    INDEX IX_ContactSubmission_Email NONCLUSTERED (Email),
    INDEX IX_ContactSubmission_IsRead_SubmittedAt NONCLUSTERED (IsRead, SubmittedAt DESC),
    INDEX IX_ContactSubmission_SubmittedAt NONCLUSTERED (SubmittedAt DESC)
);

--Portfolio Projects
CREATE TABLE Projects (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NTEXT,
    TechnologyStack NVARCHAR (500),
    ProjectURL NVARCHAR(500),
    GitHubURL NVARCHAR(500),
    ImageURL NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()

    INDEX IX_Projects_IsActive_CreatedAt NONCLUSTERED (IsActive, CreatedAt DESC),
    INDEX IX_Projects_TechnologyStack NONCLUSTERED (TechnologyStack) WHERE IsActive = 1,
    INDEX IX_Projects_Featured_IsActive NONCLUSTERED (Featured, IsActive, CreatedAt DESC) WHERE Featured = 1 AND IsActive = 1
);


-- Sample data
INSERT INTO Projects (Title, Description, TechnologyStack, ProjectURL, GitHubURL)
VALUES 
('Node.js API', 'RESTful API with health endpoints', 'Node.js, Express, SQL Server', NULL, 'https://github.com/AlvinLogen/node-api-starter'),
('Portfolio Website', 'Personal portfolio with responsive design', 'HTML, CSS, JavaScript', 'http://localhost', 'https://github.com/AlvinLogen/engineering-playbook');
GO