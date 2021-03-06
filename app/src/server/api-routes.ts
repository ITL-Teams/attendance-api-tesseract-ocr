import { Router } from 'express'
import { ImageUploaderService } from '../services/ImageUploader'
import { ImageToTextService } from '../services/ImageToText'
import { StudentNameParserService } from '../services/StudentNameParserService'
import { ImageDeleterService } from '../services/ImageDeleter'
import { UpdateStudentList } from '../services/UpdateStudentList'
import { TakeAttendance } from '../services/TakeAttendance'
import { validateRequest } from './utils'
import { StudentAttendance } from '../domain/StudentAttendance'
import { CurrentDate } from '../services/CurrentDate'
export const router = Router()

const attendance = new StudentAttendance()

router.delete('/clean-student-list', async (request, response) => {
  try {
    attendance.cleanStudentList()

    response.json({
      success: true
    })
  } catch (error) {
    response.json({
      error: {
        message: new String(error).toString()
      }
    })
  }
})

router.get('/attendance-list', async (request, response) => {
  try {
    const dateService = new CurrentDate()

    response.json({
      success: {
        date: dateService.invoke(),
        attendance: attendance.getAttendanceList()
      }
    })
  } catch (error) {
    response.json({
      error: {
        message: new String(error).toString()
      }
    })
  }
})

router.put('/update-student-list', async (request, response) => {
  try {
    validateRequest([
      {
        value_name: 'students',
        value: request.body.students,
        expected: 'object'
      }
    ])

    const updateListService = new UpdateStudentList(
      attendance,
      request.body.students
    )
    updateListService.invoke()

    response.json({
      success: true
    })
  } catch (error) {
    response.json({
      error: {
        message: new String(error).toString()
      }
    })
  }
})

router.post('/take-attendance', async (request, response) => {
  const image = request.body.img

  try {
    validateRequest([
      {
        value_name: 'img',
        value: image,
        expected: 'string'
      }
    ])

    const imageName = new ImageUploaderService(image).invoke()
    const imageToTextService = new ImageToTextService(imageName)

    const imageText = await imageToTextService.invoke()

    const parserOutput = new StudentNameParserService(imageText).invoke()
    new ImageDeleterService(imageName).invoke()

    const attendanceService = new TakeAttendance(attendance, parserOutput.names)
    attendanceService.invoke()

    response.json({
      success: true
    })
  } catch (error) {
    response.json({
      error: {
        message: new String(error).toString()
      }
    })
  }
})
