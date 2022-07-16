import localforage from 'localforage/src/localforage.js'

export const updateTaskStatus = async (prefix, taskName, status) => {
  if (status !== 'completed') {
    localforage.setItem(prefix + taskName + '-status', status)
    return {
      status: 'success'
    }
  } else {
    localforage.removeItem(prefix + taskName + '-status')
    return {
      status: 'success'
    }
  }
}
