const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  userId,
  userName = 'System',
  userRole = 'admin',
  action,
  entityType,
  entityId = '',
  description,
  metadata = {},
  ipAddress = '',
}) => {
  try {
    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress,
    });
  } catch (error) {
    console.error(`[Audit Log Failed]: ${error.message}`);
  }
};

module.exports = {
  logAuditEvent,
};
