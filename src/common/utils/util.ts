import {
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common'
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as _ from 'lodash'
import moment from 'moment-timezone'
import * as path from 'path'
import { config } from 'src/config'

export class Utils {
  static md5(contents: string): string {
    return crypto.createHash('md5').update(contents).digest('hex')
  }

  /**
   * snake case object key
   * @param obj
   */
  static snakeCaseKey(obj: { [x: string]: any }): { [x: string]: any } {
    if (typeof obj != 'object') return obj

    for (const oldName in obj) {
      // Camel to underscore
      const newName = _.snakeCase(oldName)

      // Only process if names are different
      if (newName != oldName) {
        // Check for the old property name to avoid a ReferenceError in strict mode.
        if (obj.hasOwnProperty(oldName)) {
          obj[newName] = obj[oldName]
          delete obj[oldName]
        }
      }

      // Recursion
      if (typeof obj[newName] == 'object') {
        obj[newName] = Utils.snakeCaseKey(obj[newName])
      }
    }
    return obj
  }

  /**
   * Parse datetime object key
   * @param obj
   */
  static parseDatetime(obj: { [x: string]: any }, timezone: string): any {
    if (typeof obj != 'object') return obj

    for (const oldName in obj) {
      // Recursion
      if (typeof obj[oldName] == 'object') {
        obj[oldName] = Utils.parseDatetime(obj[oldName], timezone)
      }
    }

    if (obj instanceof Date) {
      const date = moment.tz(obj, timezone).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')

      return date
    }

    return obj
  }

  /**
   * make a delay for milisecond before continue to next process
   * @param milisecond
   */
  static takeDelay(milisecond: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, milisecond)
    })
  }

  static async moveFile(
    fileOriginalRelativePath: string,
    fileDestPath: string,
  ): Promise<string> {
    switch (config.assets.storage.toLocaleLowerCase()) {
      case 'gcs':
        // under contruction
        return ''
      case 's3':
        const file = fs.readFileSync(fileOriginalRelativePath)
        const s3 = null

        const filename = fileDestPath.replace(/^.*[\\\/]/, '')

        // TEMPORARY ALL PUBLIC ACCESS
        const params = {
          Bucket: config.storage.s3.bucketName,
          Key: filename,
          Body: file,
          ACL: 'public-read',
        }

        try {
          const s3Response = await s3.upload(params).promise()
          return s3Response.Location
        } catch (e) {
          throw new InternalServerErrorException(e)
        }

      default:
        const fileDestRelativePath =
          path.resolve('./') + '/dist/' + config.assets.public + fileDestPath
        fs.rename(
          fileOriginalRelativePath,
          fileDestRelativePath,
          function (err) {
            if (err) {
              err
            }
          },
        )

        return Utils.pathToUrl(fileDestPath)
    }
  }

  static pathToUrl(path: string): string {
    return config.host + ('/attachment/' + path).replace(/\/\//g, '/')
  }

  /**
   * count pagination offset
   * @param {number} page
   * @param {number} perPage
   * @returns {number}
   */
  static countOffset(page?: number, perPage?: number): number {
    page = page ?? 1
    perPage = perPage ?? 10

    return (page - 1) * perPage
  }
  static padTo2Digits(num: number): string {
    return num.toString().padStart(2, '0')
  }

  static moneyFormat(angka: string, prefix: string): string {
    const numberString = angka.replace(/[^,\d]/g, '').toString()
    const split = numberString.split(',')
    const sisa = split[0].length % 3
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

    let rupiah = split[0].substr(0, sisa)

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
      const separator = sisa ? '.' : ''
      rupiah += separator + ribuan.join('.')
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah
    return prefix == undefined ? rupiah : rupiah ? 'Rp. ' + rupiah : ''
  }

  static formatDateISO8601(date: Date): string {
    return (
      [
        date.getFullYear(),
        Utils.padTo2Digits(date.getMonth() + 1),
        Utils.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        Utils.padTo2Digits(date.getHours()),
        Utils.padTo2Digits(date.getMinutes()),
        Utils.padTo2Digits(date.getSeconds()),
      ].join(':')
    )
  }

  static ucFirstChar(str: string): string {
    return str[0].toUpperCase() + str.slice(1)
  }

  /**
   * find the next occurance date of the day specified
   * ex. startingDate is friday 2021-09-10
   * then the next monday is on 2021-09-13
   * @param startingDate the starting date
   * @param nearestDay the day expected in number (0 - 6)
   * @returns {Date}
   */
  static dateOfNearestDay(startingDate: Date, nearestDay: number): Date {
    const nearestTime = new Date(startingDate.getTime())

    if (startingDate.getDay() == 6 && nearestDay == 5) {
      nearestTime.setDate(
        startingDate.getDate() +
        ((7 + nearestDay - startingDate.getDay()) % 7) -
        7,
      )
    } else {
      nearestTime.setDate(
        startingDate.getDate() + ((7 + nearestDay - startingDate.getDay()) % 7),
      )
    }

    return nearestTime
  }

  /**
   * Find the diffirence in days between 2 dates
   * @param date1
   * @param date2
   * @returns {number}
   */
  static diffInDays(date1: Date, date2: Date): number {
    const timeDiff = date1.getTime() - date2.getTime()
    return timeDiff / (1000 * 60 * 60 * 24)
  }

  /**
   * Get platform fee from given amount
   * @param {string | number | BN} amount
   * @returns {BN}
   */
  static getPlatformFee(amount: string | number | BN): BN {
    const bnAmount = new BN(amount)

    return bnAmount
      .muln(config.calculation.platformFee)
      .divn(config.calculation.maxPercentage)
  }

  static getFromWeiToUsd(amount: BN): string {
    return new BigNumber(amount.toString()).dividedBy(10 ** 6).toFixed()
  }
}

export const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      new UnprocessableEntityException('This file type is not allowed!'),
    )
  }
  callback(null, true)
}

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }

  return true
}
