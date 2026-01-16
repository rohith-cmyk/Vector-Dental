import { Router, Request, Response } from 'express'

const router = Router()

/**
 * Debug endpoint to test form submission
 * POST /api/debug/test-submit
 */
router.post('/test-submit', (req: Request, res: Response) => {
  console.log('=== DEBUG TEST SUBMIT ===')
  console.log('Request headers:', req.headers['content-type'])
  console.log('Request body keys:', Object.keys(req.body || {}))
  console.log('Request body:', req.body)
  console.log('Files:', (req as any).files)
  console.log('========================')
  
  res.json({
    success: true,
    message: 'Debug endpoint working',
    bodyKeys: Object.keys(req.body || {}),
    hasFiles: !!((req as any).files && (req as any).files.length > 0),
  })
})

export default router




