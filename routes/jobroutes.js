const express=require('express');
const {getAllJobs,createJob,updateJob,getJob,deleteJob}=require('./../controllers/jobsController')


const router=express.Router();

router.route('/').get(getAllJobs)
                  .post(createJob);

router.route('/:id').get(getJob)
                    .patch(updateJob)
                    .delete(deleteJob)

module.exports=router;