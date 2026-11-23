const express = require('express')
const kycModel = require('../model/employerKyc')
const userModel = require('../model/user')
const postJobModel = require('../model/postJob')
const applyJobModel = require('../model/jobApply')
const notificationModel = require('../model/notification')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const mongoose = require('mongoose')
const validator = require('validator');

exports.employerKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }

        const existingKyc = await kycModel.findOne({ employerId: id });
        
      if (existingKyc) {
      return next({
          message: existingKyc.kycVerified
              ? "KYC already verified for this user"
              : "KYC already submitted and pending verification",
          statusCode: 400
      });
  }

        const ALLOWED_ROLES = ['employer', 'hr'];

        const checkRole = await userModel.findById(id);
        if (!checkRole) {
    return next({
        message: "User not found",
        statusCode: 404
    });
}

if (!ALLOWED_ROLES.includes(checkRole.role)) {
    return next({
        message: "Unauthorized: Only employers can submit KYC",
        statusCode: 403
    });
}
        const { fullLegalName, jobTitle, workEmail, companyName, registrationNumber, registeredAddress, companyWebsite, organizationSize } = req.body;

        if (!fullLegalName || !jobTitle || !workEmail || !companyName || !registrationNumber || !registeredAddress || !organizationSize) {
            return next({
                message: "All fields are required",
                statusCode: 400
            })
        }

        if (!workEmail || !workEmail.includes('@') || !workEmail.includes('.')) {
    return next({
        message: 'Input a valid Email Address',
        statusCode: 400
    });
}

        const idFiles = req.files?.identification || [];
const selfieFiles = req.files?.selfie || [];
const businessDocumentFiles = req.files?.businessDocument || [];

if (!idFiles.length || !selfieFiles.length || !businessDocumentFiles) {
    return next({
        message: "Identification, business registration document and selfie images are required",
        statusCode: 400
    });
}

const uploadGroup = async (files) => {
    const urls = [];
    const publicIds = [];
    for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'Ridify/employerKyc',
        });
        urls.push(result.secure_url);
        publicIds.push(result.public_id);
        fs.unlinkSync(file.path);
    }
    return { urls, publicIds };
};

const idUpload = await uploadGroup(idFiles);
const selfieUpload = await uploadGroup(selfieFiles);
const businessDocumentUpload = await uploadGroup(businessDocumentFiles);


        const employerData = {
            employerId: id,
            fullLegalName,
            jobTitle,
            workEmail,
            companyName,
            registrationNumber,
            registeredAddress,
            companyWebsite,
            organizationSize,
            identification: idUpload.urls[0],
            identificationPublicId: idUpload.publicIds[0],
            businessDocument: businessDocumentUpload.urls[0],
            businessDocumentPublicId: businessDocumentUpload.publicIds[0],
            selfie: selfieUpload.urls[0],
            selfiePublicId: selfieUpload.publicIds[0],
        };

        const kyc = await kycModel.create(employerData);

        res.status(201).json({
            message: "Employer KYC submitted successfully",
            data: kyc
        })

    } catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getEmployerKyc = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id) {
            return next({
                message: "User not authenticated",
                statusCode: 401
            })
        }
        const kyc = await kycModel.findOne({ employerId: id });
        
        if (!kyc) {
            return next({
                message: "KYC not found for this user",
                statusCode: 404
            })
        }

        if( kyc.employerId.toString() !== id) {
            return next({
                message: "Unauthorized: You can only access your own KYC information",
                statusCode: 403
            })
        }
        res.status(200).json({
            message: "KYC found for this user",
            data: kyc
        })
    }catch (error) {
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

const JOB_POSTER_ROLES = ['hr', 'employer', 'jobagent']; 

exports.postJob = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Unauthorised', statusCode: 401 });
        }

        const jobTitle = String(req.body.jobTitle || '').trim();
        const aboutJob = String(req.body.aboutJob || '').trim();
        const description = String(req.body.description || '').trim();
        const qualification = String(req.body.qualification || '').trim();
        const experience = String(req.body.experience || '').trim();

        if (!jobTitle || !aboutJob || !description || !qualification || !experience) {
            return next({ message: 'Please fill all the fields', statusCode: 400 });
        }

        const poster = await userModel.findById(id).select('role');

        if (!poster) {
            return next({ message: 'User not found', statusCode: 404 });
        }

        if (!JOB_POSTER_ROLES.includes(poster.role)) {
            return next({
                message: 'You are not permitted to perform this action',
                statusCode: 403
            });
        }

        const job = await postJobModel.create({
            posterId: id,
            jobTitle,
            aboutJob,
            description,
            qualification,
            experience
        });

        try{const user = await userModel.find({ role: 'jobSeeker' }).select('-password -loginAttempts -lockUntil -__v').sort({ createdAt: -1 }).lean()

        if (jobSeekers.length) {
        await notificationModel.insertMany(
            jobSeekers.map((seeker) => ({
                recipient: seeker._id,
                sender: id,
                title: 'New Job Alert',
                message: `${poster.fullName} posted a new job: ${jobTitle}`,
                type: 'job',
                idType: 'jobId',
                id: job._id
            }))
        );
    }}catch(notifyError){
        console.error('Failed to create job notifications:', notifyError.message);
    }

        return res.status(201).json({
            message: 'Job posted successfully',
            data: job
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getAllJobs = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid Id', statusCode: 401 });
        }

        const jobs = await postJobModel
            .find({ posterId: id })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: jobs.length === 0
                ? 'No jobs to display'
                : 'Jobs retrieved successfully',
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getJob = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid Id', statusCode: 401 });
        }

        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return next({ message: 'Invalid job ID', statusCode: 400 });
        }
        
        const job = await postJobModel
            .findOne({ _id: jobId, posterId: id })
            .lean();

        if (!job) {
            return next({ message: 'Job not found', statusCode: 404 });
        }

        return res.status(200).json({
            message: 'Job retrieved successfully',
            data: job
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const JOB_STATUSES = ['open', 'closed', 'paused']; 

exports.changeStatus = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User Id', statusCode: 401 });
        }

        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return next({ message: 'Invalid Job Id', statusCode: 400 });
        }

        const statusInput = String(req.body.status || '').trim();

        if (!statusInput) {
            return next({ message: 'Status is required', statusCode: 400 });
        }

        const status = JOB_STATUSES.find(
            (s) => s.toLowerCase() === statusInput.toLowerCase()
        );

        if (!status) {
            return next({
                message: `Status must be one of: ${JOB_STATUSES.join(', ')}`,
                statusCode: 400
            });
        }

        const job = await postJobModel.findOneAndUpdate(
            { _id: jobId, posterId: id },
            { status },
            { new: true, runValidators: true }
        ).lean();

        if (!job) {
            return next({ message: 'Job not found or not posted by you', statusCode: 404 });
        }

        return res.status(200).json({
            message: 'Status updated successfully',
            data: job
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.deleteJob = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid user ID', statusCode: 401 });
        }

        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return next({ message: 'Invalid job ID', statusCode: 400 });
        }

        const deletedJob = await postJobModel.findOneAndUpdate(
            { _id: jobId, posterId: id, isDeleted: { $ne: true } },
            { isDeleted: true },
            { new: true }
        );

        try {
            await notificationModel.deleteMany({ jobId: deletedJob._id, type: 'job' });
        } catch (notifyError) {
            console.error('Failed to remove job notifications:', notifyError.message);
        }

        if (!deletedJob) {
            return next({ message: 'Job not found or not posted by you', statusCode: 404 });
        }


        return res.status(200).json({
            message: 'Job deleted successfully',
            data: {
                _id: deletedJob._id,
                posterId: deletedJob.posterId,
                jobTitle: deletedJob.jobTitle
            }
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

const removeTempFiles = (files) => {
    for (const file of files) {
        try {
            if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Temp file cleanup failed:', err.message);
        }
    }
};

exports.applyJob = async (req, res, next) => {
    const cvFiles = req.files?.cv || [];
    const coverLetterFiles = req.files?.coverLetter || [];
    const tempFiles = [...cvFiles, ...coverLetterFiles];

    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'Invalid User Id', statusCode: 401 });
        }

        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return next({ message: 'Invalid job ID', statusCode: 400 });
        }

        const fullname = String(req.body?.fullname || '').trim();
        const email = String(req.body?.email || '').trim().toLowerCase();
        const description = String(req.body?.description || '').trim().slice(0, 1000);

        if (!fullname || !email) {
            return next({ message: 'Fullname and email are required', statusCode: 400 });
        }

        if (!validator.isEmail(email)) {
            return next({ message: 'Input a valid Email Address', statusCode: 400 });
        }

        if (!cvFiles.length || !coverLetterFiles.length) {
            return next({ message: 'CV and Cover Letter required', statusCode: 400 });
        }

        const job = await postJobModel.findOne({ _id: jobId, isDeleted: { $ne: true } });

        if (!job) {
            return next({ message: 'Job not found', statusCode: 404 });
        }

        if (job.status !== 'open') {
            return next({ message: 'Job is not open for applications', statusCode: 400 });
        }

        if (String(job.posterId) === String(id)) {
            return next({ message: 'You cannot apply to your own job', statusCode: 400 });
        }

        const alreadyApplied = await applyJobModel.findOne({ applicantId: id, jobId });

        if (alreadyApplied) {
            return next({ message: 'You have already applied for this job', statusCode: 409 });
        }

        const cvUpload = await cloudinary.uploader.upload(cvFiles[0].path, {
            folder: 'Ridify/applyJob',
            resource_type: 'auto'
        });

        const coverLetterUpload = await cloudinary.uploader.upload(coverLetterFiles[0].path, {
            folder: 'Ridify/applyJob',
            resource_type: 'auto'
        });

        const application = await applyJobModel.create({
            applicantId: id,
            jobId: job._id,
            fullname,
            email,
            description,
            cv: cvUpload.secure_url,
            cvPublicId: cvUpload.public_id,
            coverLetter: coverLetterUpload.secure_url,
            coverLetterPublicId: coverLetterUpload.public_id
        });

        await notificationModel.create({

            recipient: job.posterId,

            sender: req.user.id,

            title: "New Application Request",

            message: `${fullname} applied for your job: ${job.jobTitle}`,

            type: "application",

            idType: "applicationId",

            id: application._id
        });

        return res.status(201).json({
            message: 'Job applied successfully',
            data: {
                _id: application._id,
                applicantId: application.applicantId,
                jobId: application.jobId,
                fullname: application.fullname,
                email: application.email,
                description: application.description,
                cv: application.cv,
                coverLetter: application.coverLetter,
                createdAt: application.createdAt
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return next({ message: 'You have already applied for this job', statusCode: 409 });
        }
        return next({ message: error.message, statusCode: 500 });
    } finally {
        removeTempFiles(tempFiles);
    }
};

exports.getJobsByApplicant = async (req, res, next) => {
    try{
        const { id } = req.user;

    if (!mongoose.isValidObjectId(id)) {
        return next({
            message: 'User not authenticated',
            statusCode: 401
        })
    }

    const applications = await applyJobModel
            .find({ applicantId: id })
            .select('-cvPublicId -coverLetterPublicId')
            .populate('jobId', 'jobTitle aboutJob experience posterId')
            .sort({ createdAt: -1 })
            .lean();

    return res.status(200).json({
            message: applications.length ? 'Applications retrieved successfully' : 'No applications to display',
            count: applications.length,
            data: applications
        });
        
}catch (error){
        return next({
            message: error.message,
            statusCode: 500
        })
    }
}

exports.getJobsByJobId = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return next({ message: 'Input a valid job ID', statusCode: 400 });
        }

        const job = await postJobModel
            .findOne({ _id: jobId, posterId: id })
            .select('_id jobTitle')
            .lean();

        if (!job) {
            return next({ message: 'Job not found or not posted by you', statusCode: 404 });
        }

        const applicants = await applyJobModel
            .find({ jobId })
            .select('-cvPublicId -coverLetterPublicId')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: applicants.length === 0
                ? 'No applicants for this job'
                : 'Applicants retrieved successfully',
            count: applicants.length,
            data: applicants
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};

exports.getSingleApplication = async (req, res, next) => {
    try {
        const { id } = req.user;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return next({ message: 'User not authenticated', statusCode: 401 });
        }

        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return next({ message: 'Input a valid application ID', statusCode: 400 });
        }

        const application = await applyJobModel
            .findById(applicationId)
            .select('-cvPublicId -coverLetterPublicId')
            .lean();

        if (!application) {
            return next({ message: 'Application not found', statusCode: 404 });
        }

        const job = await postJobModel
            .findById(application.jobId)
            .select('posterId jobTitle')
            .lean();

        const isApplicant = String(application.applicantId) === String(id);
        const isPoster = job && String(job.posterId) === String(id);

        if (!isApplicant && !isPoster) {
            return next({ message: 'Application not found', statusCode: 404 });
        }

        return res.status(200).json({
            message: 'Application retrieved successfully',
            data: {
                ...application,
                jobTitle: job ? job.jobTitle : null
            }
        });
    } catch (error) {
        return next({ message: error.message, statusCode: 500 });
    }
};