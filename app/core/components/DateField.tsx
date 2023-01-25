import { Flex, Select, Text } from "@chakra-ui/react"
import { FC, useEffect, useState } from "react"
import { FieldInputProps, useField } from "react-final-form"

// Get number of days for a given year and month
const getDays = (year?: number, month?: number) => {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export type DateFieldProps = Partial<FieldInputProps<string>> & {
  name: string
}

const DateField: FC<DateFieldProps> = (props) => {
  const {
    input: { onChange },
    meta,
  } = useField(props.name, {
    type: "date",
    ...props,
  })
  const [month, setMonth] = useState<number | undefined>()
  const [day, setDay] = useState<number | undefined>()
  const [year, setYear] = useState<number | undefined>()

  useEffect(() => {
    if (month && day && year) {
      onChange({
        target: {
          value: new Date(year, month, day),
        },
      })
    }
  }, [month, day, year, onChange])

  return (
    <Flex flexDir="column">
      <Flex
        flexDir="column"
        gridGap="1.5rem"
        sx={{
          "> div": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.35)",
            width: "xs",
            maxWidth: "100%",
          },
        }}
      >
        <Select
          required
          size="lg"
          onChange={(evt) => setMonth(parseInt(evt.target.value, 10))}
          value={month}
        >
          <option value="" disabled selected key="month_placeholder">
            Month
          </option>
          {monthNames.map((monthName, index) => (
            <option key={monthName} value={index + 1}>
              {monthName}
            </option>
          ))}
        </Select>
        <Select
          required
          size="lg"
          value={day}
          onChange={(evt) => setDay(parseInt(evt.target.value, 10))}
        >
          <option value="" disabled selected key="day_placeholder">
            Day
          </option>
          {Array.from({ length: getDays(year, month) }).map((_, index) => (
            <option key={index} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </Select>
        <Select
          required
          size="lg"
          value={year}
          onChange={(evt) => setYear(parseInt(evt.target.value, 10))}
        >
          <option value="" disabled selected key="year_placeholder">
            Year
          </option>
          {Array.from({ length: 120 }).map((_, index) => (
            <option key={index} value={new Date().getFullYear() - index}>
              {new Date().getFullYear() - index}
            </option>
          ))}
        </Select>
      </Flex>
      {((meta.error && meta.touched) || meta.submitError) && (
        <Text color="red.500" fontSize="sm">
          {meta.error || meta.submitError}
        </Text>
      )}
    </Flex>
  )
}

export default DateField
