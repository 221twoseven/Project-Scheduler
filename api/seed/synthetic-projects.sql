-- Synthetic Project rows for staging and the SQL tests. Invented, not copied: no real
-- client, job or person. Never a migration, so production never receives them.
INSERT dbo.Project (id, legacyAppId, name, client, jobCode, deadline, status, projectManager, drafter, leadFab, fabricators, activeDepartments, sortIndex, createdAt, confirmedAt, confirmedBy)
VALUES
  ('3f2a8c1e-0000-4000-8000-000000000001', 'synthetic0001aaaaaa', N'Sample Window Display', N'Example Retail Co.', N'EX-0001', '2027-03-15', N'in-fabrication',
   N'Sample PM A', N'Sample Drafter A', N'Sample Lead A', N'Sample Fabricator A, Sample Fabricator B',
   N'["pm","td","cnc","fab","finish","install"]', 1, '2026-11-01', '2026-11-18T14:30:00.000', N'Sample PM A'),
  ('3f2a8c1e-0000-4000-8000-000000000002', 'synthetic0002bbbbbb', N'Sample Pop-up Booth', N'Example Events LLC', N'EX-0002', '2027-05-01', N'estimating',
   N'Sample PM B', N'', N'', N'',
   N'["pm","td","print","laser","install"]', 2.5, '2026-11-02', NULL, NULL),
  ('3f2a8c1e-0000-4000-8000-000000000003', NULL, N'Sample Lobby Sign', N'Example Holdings', N'', NULL, N'auto',
   N'', N'', N'', N'',
   N'[]', NULL, NULL, NULL, NULL);
